if Dropbox.Env.global.XMLHttpRequest
  # Browser or Web Worker.
  if Dropbox.Env.global.XDomainRequest and
      not ('withCredentials' of new XMLHttpRequest())
    DbxXhrRequest = XDomainRequest
    DbxXhrIeMode = true
    # IE's XDR doesn't allow setting requests' Content-Type to anything other
    # than text/plain, so it can't send _any_ forms.
    DbxXhrCanSendForms = false
  else
    DbxXhrRequest = XMLHttpRequest
    DbxXhrIeMode = false
    # Web Workers don't support FormData at all.
    # Also, Firefox doesn't support adding named files to FormData.
    # https://bugzilla.mozilla.org/show_bug.cgi?id=690659
    DbxXhrCanSendForms = typeof FormData isnt 'undefined' and
      navigator.userAgent.indexOf('Firefox') is -1
  DbxXhrDoesPreflight = true
else
  # Node.js.
  DbxXhrRequest = Dropbox.Env.require 'xhr2'  # We need an XHR emulation.
  DbxXhrIeMode = false
  # Node.js doesn't have FormData. We wouldn't want to bother putting together
  # upload forms in node.js anyway, because it doesn't do CORS preflight
  # checks, so we can use PUT requests without a performance hit.
  DbxXhrCanSendForms = false
  # Our XHR emulation skips CORS checks, which don't make sense for a server.
  DbxXhrDoesPreflight = false

if !Dropbox.Env.global.Uint8Array
  # IE <= 9
  DbxXhrArrayBufferView = null
  DbxXhrWrapBlob = false
  DbxXhrSendArrayBufferView = false
else
  # The ArrayBufferView constructor is not exposed.
  if Object.getPrototypeOf
    DbxXhrArrayBufferView = Object.getPrototypeOf(
        Object.getPrototypeOf(new Uint8Array(0))).constructor
  else if Object.__proto__
    DbxXhrArrayBufferView =
        (new Uint8Array(0)).__proto__.__proto__.constructor

  if !Dropbox.Env.global.Blob
    DbxXhrWrapBlob = false
    DbxXhrSendArrayBufferView = true
  else
    try
      do ->
        if (new Blob [new Uint8Array(2)]).size is 2
          DbxXhrWrapBlob = true
          DbxXhrSendArrayBufferView = true
        else
          DbxXhrSendArrayBufferView = false
          DbxXhrWrapBlob = (new Blob [new ArrayBuffer(2)]).size is 2
    catch
      DbxXhrSendArrayBufferView = false
      DbxXhrWrapBlob = false
      if Dropbox.Env.global.WebKitBlobBuilder
        # Android's WebView doesn't support adding named files to FormData.
        if navigator.userAgent.indexOf('Android') isnt -1
          DbxXhrCanSendForms = false

    if DbxXhrArrayBufferView is Object
      # Browsers that haven't implemented XHR#send(ArrayBufferView) also don't
      # have a real ArrayBufferView prototype. (Safari, Firefox)
      DbxXhrSendArrayBufferView = false

# Dispatches low-level HTTP requests.
#
# This wraps XMLHttpRequest or its equivalents (XDomainRequest on IE 9 and
# below) and works around bugs and inconsistencies in various implementations.
class Dropbox.Util.Xhr
  # The constructor used to build AJAX requests (XMLHttpRequest).
  #
  # @private
  # {Dropbox.Util.Xhr} instances will wrap instances built by this constructor.
  #
  # This is XMLHttpRequest on modern browsers.
  @Request = DbxXhrRequest

  # Set to true when using the XDomainRequest API.
  #
  # @private
  # This is used by {Dropbox.Util.Xhr} and {Dropbox.Client}, to decide when to
  # use workarounds for IE limitations.
  @ieXdr = DbxXhrIeMode

  # Set to true if the platform has proper support for FormData.
  #
  # @private
  # This is used by {Dropbox.Util.Xhr} and {Dropbox.Client} to decide what REST
  # API calls to use.
  @canSendForms = DbxXhrCanSendForms

  # Set to true if the platform performs CORS preflight checks.
  #
  # @private
  # This is used by {Dropbox.Util.Xhr} and {Dropbox.Client} to decide when to
  # use HTTP headers vs query parameters.
  @doesPreflight = DbxXhrDoesPreflight

  # The closest superclass for all ArrayBufferView objects.
  #
  # @private
  # This is used by {Dropbox.Util.Xhr} to work around bugs in browsers' XHR
  # level 2 implementation.
  @ArrayBufferView = DbxXhrArrayBufferView

  # True if we think we can send ArrayBufferView objects via XHR.
  #
  # @private
  # This is used by {Dropbox.Util.Xhr} to work around bugs in browsers' XHR
  # level 2 implementation.
  @sendArrayBufferView = DbxXhrSendArrayBufferView

  # True if ArrayBuffer and ArrayBufferView instances get wrapped in Blobs
  # before sending via XHR.
  #
  # @private
  # This is used by {Dropbox.Util.Xhr} to work around bugs in browsers' XHR
  # level 2 implementation.
  @wrapBlob = DbxXhrWrapBlob

  # Sets up an AJAX request.
  #
  # @param {String} method the HTTP method used to make the request ('GET',
  #   'POST', 'PUT', etc.)
  # @param {String} baseUrl the URL that receives the request; this URL might
  #   be modified, e.g. by appending parameters for GET requests
  constructor: (@method, baseUrl) ->
    @isGet = @method is 'GET'
    @url = baseUrl
    @wantHeaders = false
    @headers = {}
    @params = null
    @body = null
    @preflight = not (@isGet or (@method is 'POST'))
    @signed = false
    @completed = false
    @responseType = null
    @callback = null
    @xhr = null
    @onError = null

  # The XMLHttpRequest object used to make the request.
  #
  # This is null before {Dropbox.Util.Xhr#prepare} is called
  #
  # @property {XMLHttpRequest}
  xhr: null

  # Called when the HTTP request fails.
  #
  # If the underlying XMLHttpRequest fails and this is not null, this callback
  # will receive a {Dropbox.ApiError} instance as its first argument. The
  # function is responsible for calling its 2nd argument and passing it the
  # {Dropbox.ApiError}. If the function does not do that, the callback passed
  # to {Dropbox.Util.Xhr#send} or {Dropbox.Util.Xhr#} will not be called
  #
  # @property {function(Dropbox.ApiError, function(Dropbox.ApiError))}
  onError: null

  # Sets the parameters (form field values) that will be sent with the request.
  #
  # @param {?Object} params an associative array (hash) containing the HTTP
  #   request parameters
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  setParams: (params) ->
    if @signed
      throw new Error 'setParams called after addOauthParams or addOauthHeader'
    if @params
      throw new Error 'setParams cannot be called twice'
    @params = params
    @

  # Sets the function called when the HTTP request completes.
  #
  # This function can also be set when calling {Dropbox.Util.Xhr#send}.
  #
  # @param {function(Dropbox.ApiError, Object, Object, Object)} callback called
  #   when the XMLHttpRequest completes; if an error occurs, the first
  #   parameter will be a {Dropbox.ApiError}; otherwise, the first parameter
  #   will be null, the second parameter will be an instance of the required
  #   response type (e.g., String, Blob), the third parameter will be the
  #   JSON-parsed 'x-dropbox-metadata' header, and the fourth parameter will be
  #   an object containing all the headers
  #
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  setCallback: (@callback) ->
    @

  # Amends the request parameters to include an OAuth signature.
  #
  # The OAuth signature will become invalid if the parameters are changed after
  # the signing process.
  #
  # This method automatically decides the best way to add the OAuth signature
  # to the current request. Modifying the request in any way (e.g., by adding
  # headers) might result in a valid signature that is applied in a sub-optimal
  # fashion. For best results, call this right before Dropbox.Util.Xhr#prepare.
  #
  # @param {Dropbox.Util.Oauth} oauth OAuth instance whose key and secret will
  #   be used to sign the request
  # @param {Boolean} cacheFriendly if true, the signing process choice will be
  #   biased towards allowing the HTTP cache to work; by default, the choice
  #   attempts to avoid the CORS preflight request whenever possible
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  signWithOauth: (oauth, cacheFriendly) ->
    if Dropbox.Util.Xhr.ieXdr
      @addOauthParams oauth
    else if @preflight or !Dropbox.Util.Xhr.doesPreflight
      @addOauthHeader oauth
    else
      if @isGet and cacheFriendly
        @addOauthHeader oauth
      else
        @addOauthParams oauth

  # Amends the request parameters to include an OAuth signature.
  #
  # The OAuth signature will become invalid if the parameters are changed after
  # the signing process.
  #
  # @param {Dropbox.Util.Oauth} oauth OAuth instance whose key and secret will
  #   be used to sign the request
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  addOauthParams: (oauth) ->
    if @signed
      throw new Error 'Request already has an OAuth signature'

    @params or= {}
    oauth.addAuthParams @method, @url, @params
    @signed = true
    @

  # Adds an Authorize header containing an OAuth signature.
  #
  # The OAuth signature will become invalid if the parameters are changed after
  # the signing process.
  #
  # @param {Dropbox.Util.Oauth} oauth OAuth instance whose key and secret will
  #   be used to sign the request
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  addOauthHeader: (oauth) ->
    if @signed
      throw new Error 'Request already has an OAuth signature'

    @params or= {}
    @signed = true
    @setHeader 'Authorization', oauth.authHeader(@method, @url, @params)

  # Sets the body (piece of data) that will be sent with the request.
  #
  # @param {String, Blob, ArrayBuffer} body the body to be sent in a request;
  #   GET requests cannot have a body
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  setBody: (body) ->
    if @isGet
      throw new Error 'setBody cannot be called on GET requests'
    if @body isnt null
      throw new Error 'Request already has a body'

    if typeof body is 'string'
      # Content-Type will be set automatically.
    else if (typeof FormData isnt 'undefined') and (body instanceof FormData)
      # Content-Type will be set automatically.
    else
      @headers['Content-Type'] = 'application/octet-stream'
      @preflight = true

    @body = body
    @

  # Changes the type of the response that will be passed to the callback.
  #
  # This method requires XMLHttpRequest Level 2 support, which is not available
  # in Internet Explorer 9 and older.
  #
  # @param {String} responseType the value that will be assigned to the XHR's
  #   responseType property, such as "blob" or "arraybuffer"
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  setResponseType: (@responseType) ->
    @

  # Sets the value of a custom HTTP header.
  #
  # Custom HTTP headers require a CORS preflight in browsers, so requests that
  # use them will take more time to complete, especially on high-latency mobile
  # connections.
  #
  # @param {String} headerName the name of the HTTP header
  # @param {String} value the value that the header will be set to
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  setHeader: (headerName, value) ->
    if @headers[headerName]
      oldValue = @headers[headerName]
      throw new Error "HTTP header #{headerName} already set to #{oldValue}"
    if headerName is 'Content-Type'
      throw new Error 'Content-Type is automatically computed based on setBody'
    @preflight = true
    @headers[headerName] = value
    @

  # Requests that the response headers be reported to the callback.
  #
  # Response headers are not returned by default because the parsing is
  # non-trivial and produces many intermediate strings.
  #
  # Response headers are not available on Internet Explorer 9 and below.
  #
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  reportResponseHeaders: ->
    @wantHeaders = true

  # Simulates having an `<input type="file">` being sent with the request.
  #
  # @param {String} fieldName the name of the form field / parameter (not of
  #   the uploaded file)
  # @param {String} fileName the name of the uploaded file (not the name of the
  #   form field / parameter)
  # @param {String, Blob, File} fileData contents of the file to be uploaded
  # @param {?String} contentType the MIME type of the file to be uploaded; if
  #   fileData is a Blob or File, its MIME type is used instead
  setFileField: (fieldName, fileName, fileData, contentType) ->
    if @body isnt null
      throw new Error 'Request already has a body'

    if @isGet
      throw new Error 'setFileField cannot be called on GET requests'

    if typeof(fileData) is 'object'
      if typeof ArrayBuffer isnt 'undefined'
        if fileData instanceof ArrayBuffer
          # Convert ArrayBuffer -> ArrayBufferView on standard-compliant
          # browsers, to avoid warnings from the Blob constructor.
          if Dropbox.Util.Xhr.sendArrayBufferView
            fileData = new Uint8Array fileData
        else
          # Convert ArrayBufferView -> ArrayBuffer on older browsers, to avoid
          # having a Blob that contains "[object Uint8Array]" instead of the
          # actual data.
          if !Dropbox.Util.Xhr.sendArrayBufferView and
              fileData.byteOffset is 0 and
              fileData.buffer instanceof ArrayBuffer
            fileData = fileData.buffer

      contentType or= 'application/octet-stream'
      try
        fileData = new Blob [fileData], type: contentType
      catch blobError
        # Stock Android / iPhone browsers don't implement the Blob contructor.
        # This code is only used on iPhone Safari / WebView (Cordova), because
        # Android's browser has a bug in sending Blobs.
        if window.WebKitBlobBuilder
          builder = new WebKitBlobBuilder
          builder.append fileData
          if blob = builder.getBlob contentType
            fileData = blob

      # Workaround for http://crbug.com/165095
      if typeof File isnt 'undefined' and fileData instanceof File
        fileData = new Blob [fileData], type: fileData.type
      useFormData = fileData instanceof Blob
    else
      useFormData = false

    if useFormData
      @body = new FormData()
      @body.append fieldName, fileData, fileName
    else
      contentType or= 'application/octet-stream'
      boundary = @multipartBoundary()
      @headers['Content-Type'] = "multipart/form-data; boundary=#{boundary}"
      @body = ['--', boundary, "\r\n",
               'Content-Disposition: form-data; name="', fieldName,
                   '"; filename="', fileName, "\"\r\n",
               'Content-Type: ', contentType, "\r\n",
               "Content-Transfer-Encoding: binary\r\n\r\n",
               fileData,
               "\r\n", '--', boundary, '--', "\r\n"].join ''

  # Generates a MIME multipart boundary.
  #
  # @private
  # This should only be called by {Dropbox.Util.Xhr#prepare}.
  #
  # @return {String} a nonce suitable for use as a part boundary in a multipart
  #   MIME message; it is highly unlikely that the parts of the MIME message
  #   will contain the nonce
  multipartBoundary: ->
    [Date.now().toString(36), Math.random().toString(36)].join '----'

  # Moves this request's parameters to its URL.
  #
  # @private
  # This should only be called by {Dropbox.Util.Xhr#prepare}.
  #
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  paramsToUrl: ->
    if @params
      queryString = Dropbox.Util.Xhr.urlEncode @params
      if queryString.length isnt 0
        @url = [@url, '?', queryString].join ''
      @params = null
    @

  # Moves this request's parameters to its body.
  #
  # @private
  # This should only be called by {Dropbox.Util.Xhr#prepare}.
  #
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  paramsToBody: ->
    if @params
      if @body isnt null
        throw new Error 'Request already has a body'
      if @isGet
        throw new Error 'paramsToBody cannot be called on GET requests'
      @headers['Content-Type'] = 'application/x-www-form-urlencoded'
      @body = Dropbox.Util.Xhr.urlEncode @params
      @params = null
    @

  # Sets up an XHR request.
  #
  # This method completely sets up a native XHR object and stops short of
  # calling its send() method, so the API client has a chance of customizing
  # the XHR. After customizing the XHR, {Dropbox.Util.Xhr#send} should be
  # called.
  #
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  prepare: ->
    ieXdr = Dropbox.Util.Xhr.ieXdr
    if @isGet or @body isnt null or ieXdr
      @paramsToUrl()
      if @body isnt null and typeof @body is 'string'
        @headers['Content-Type'] = 'text/plain; charset=utf8'
    else
      @paramsToBody()

    @xhr = new Dropbox.Util.Xhr.Request()
    if ieXdr
      @xhr.onload = => @onXdrLoad()
      @xhr.onerror = => @onXdrError()
      @xhr.ontimeout = => @onXdrError()
      # NOTE: there are reports that XHR somtimes fails if onprogress doesn't
      #       have any handler
      @xhr.onprogress = ->
    else
      @xhr.onreadystatechange = => @onReadyStateChange()
    @xhr.open @method, @url, true

    unless ieXdr
      for own header, value of @headers
        @xhr.setRequestHeader header, value

    if @responseType
      if @responseType is 'b'
        if @xhr.overrideMimeType
          @xhr.overrideMimeType 'text/plain; charset=x-user-defined'
      else
        @xhr.responseType = @responseType

    @

  # Fires off the prepared XHR request.
  #
  # {Dropbox.Util.Xhr#prepare} should be called exactly once before this
  # method is called.
  #
  # @param {function(?Dropbox.ApiError, ?Object, ?Object)} callback called when
  #   the XHR completes; if an error occurs, the first parameter will be a
  #   Dropbox.ApiError instance; otherwise, the second parameter will be an
  #   instance of the required response type (e.g., String, Blob), and the
  #   third parameter will be the JSON-parsed 'x-dropbox-metadata' header
  # @return {Dropbox.Util.Xhr} this, for easy call chaining
  send: (callback) ->
    @callback = callback or @callback

    if @body isnt null
      body = @body
      if Dropbox.Util.Xhr.sendArrayBufferView
        # Standards-compliant browsers don't like to send() naked ArrayBuffers
        if body instanceof ArrayBuffer
          body = new Uint8Array body
      else
        # Convert ArrayBufferView -> ArrayBuffer on older browsers, because
        # they will send "[object Uint8Array]" instead of the actual data.
        if body.byteOffset is 0 and body.buffer instanceof ArrayBuffer
          body = body.buffer

      try
        @xhr.send body
      catch xhrError
        # Node.js doesn't implement Blob.
        if !Dropbox.Util.Xhr.sendArrayBufferView and Dropbox.Util.Xhr.wrapBlob
          # Firefox doesn't support sending ArrayBufferViews.
          body = new Blob [body], type: 'application/octet-stream'
          @xhr.send body
        else
          throw xhrError
    else
      @xhr.send()
    @

  # Encodes an associative array (hash) into a x-www-form-urlencoded String.
  #
  # For consistency, the keys are sorted in alphabetical order in the encoded
  # output.
  #
  # @param {Object} object the JavaScript object whose keys will be encoded
  # @return {String} the object's keys and values, encoded using
  #   x-www-form-urlencoded
  @urlEncode: (object) ->
    chunks = []
    for key, value of object
      chunks.push @urlEncodeValue(key) + '=' + @urlEncodeValue(value)
    chunks.sort().join '&'

  # Encodes an object into a x-www-form-urlencoded key or value.
  #
  # @param {Object} object the object to be encoded; the encoding calls
  #   toString() on the object to obtain its string representation
  # @return {String} encoded string, suitable for use as a key or value in an
  #   x-www-form-urlencoded string
  @urlEncodeValue: (object) ->
    encodeURIComponent(object.toString()).replace(/\!/g, '%21').
      replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').
      replace(/\*/g, '%2A')

  # Decodes an x-www-form-urlencoded String into an associative array (hash).
  #
  # @param {String} string the x-www-form-urlencoded String to be decoded
  # @return {Object} an associative array whose keys and values are all strings
  @urlDecode: (string) ->
    result = {}
    for token in string.split '&'
      kvp = token.split '='
      result[decodeURIComponent(kvp[0])] = decodeURIComponent kvp[1]
    result

  # Handles the XHR readystate event.
  onReadyStateChange: ->
    return true if @xhr.readyState isnt 4  # XMLHttpRequest.DONE is 4

    # WebKit might fire this multiple times.
    #   http://crbug.com/159827
    return true if @completed
    @completed = true

    if @xhr.status < 200 or @xhr.status >= 300
      apiError = new Dropbox.ApiError @xhr, @method, @url
      if @onError
        @onError apiError, @callback
      else
        @callback apiError
      return true

    if @wantHeaders
      allHeaders = @xhr.getAllResponseHeaders()
      if allHeaders
        headers = Dropbox.Util.Xhr.parseResponseHeaders allHeaders
      else
        # Work around https://bugzilla.mozilla.org/show_bug.cgi?id=608735
        headers = @guessResponseHeaders()
      metadataJson = headers['x-dropbox-metadata']
    else
      headers = undefined
      metadataJson = @xhr.getResponseHeader 'x-dropbox-metadata'
    if metadataJson?.length
      try
        metadata = JSON.parse metadataJson
      catch jsonError
        # The metadata header gets doubled up in Chrome with buggy extensions.
        duplicateIndex = metadataJson.search /\}\,\s*\{/
        if duplicateIndex isnt -1
          try
            metadataJson = metadataJson.substring 0, duplicateIndex + 1
            metadata = JSON.parse metadataJson
          catch jsonError
            # Make sure the app doesn't crash if the server goes crazy.
            metadata = undefined
        else
          # Make sure the app doesn't crash if the server goes crazy.
          metadata = undefined
    else
      metadata = undefined

    if @responseType
      if @responseType is 'b'
        dirtyText = if @xhr.responseText?
          @xhr.responseText
        else
          @xhr.response
        bytes = []
        for i in [0...dirtyText.length]
          bytes.push String.fromCharCode(dirtyText.charCodeAt(i) & 0xFF)
        text = bytes.join ''
        @callback null, text, metadata, headers
      else
        @callback null, @xhr.response, metadata, headers
      return true

    text = if @xhr.responseText? then @xhr.responseText else @xhr.response

    contentType = @xhr.getResponseHeader 'Content-Type'
    if contentType
      offset = contentType.indexOf ';'
      contentType = contentType.substring(0, offset) if offset isnt -1
    switch contentType
       when 'application/x-www-form-urlencoded'
         @callback null, Dropbox.Util.Xhr.urlDecode(text), metadata, headers
       when 'application/json', 'text/javascript'
         @callback null, JSON.parse(text), metadata, headers
       else
          @callback null, text, metadata, headers
    true

  # Parses a block of raw HTTP headers.
  #
  # @private
  # Called by XHR's response processing code.
  #
  # @param {String} allHeaders the return value of an getAllResponseHeaders()
  #   call on a XMLHttpRequest object
  # @return {Object<String, String>} object whose keys are the lowercased HTTP
  #   header names, and whose values are the corresponding HTTP header values
  @parseResponseHeaders: (allHeaders) ->
    headers = {}
    headerLines = allHeaders.split "\n"
    for line in headerLines
      # NOTE: IE8 doesn't support trim(); we don't implement a fallback because
      #       XDR (used on IE < 10) doesn't support headers, so this won't get
      #       called anyway
      colonIndex = line.indexOf ':'
      name = line.substring(0, colonIndex).trim().toLowerCase()
      value = line.substring(colonIndex + 1).trim()
      headers[name] = value
    headers

  # Emulates getAllResponseHeaders()+parseResponseHeaders() on buggy browsers.
  #
  # @private
  # Called by XHR's response processing code.
  #
  # @return {Object<String, String>} object whose keys are the lowercased HTTP
  #   header names, and whose values are the corresponding HTTP header values
  guessResponseHeaders: ->
    # TODO(pwnall): investigate removing this when Firefox 21 gets released.
    headers = {}
    # Using ther header names listed at
    #     http://www.w3.org/TR/cors/#simple-response-header
    # and the names used by the Dropbox API server in
    # access-control-expose-headers.
    for name in ['cache-control', 'content-language', 'content-range',
                 'content-type', 'expires', 'last-modified', 'pragma',
                 'x-dropbox-metadata']
      value = @xhr.getResponseHeader name
      headers[name] = value if value
    headers

  # Handles the XDomainRequest onload event. (IE 8, 9)
  onXdrLoad: ->
    # WebKit fires onreadystatechange multiple times, might as well include the
    # same fix in IE-specific code.
    return true if @completed
    @completed = true

    text = @xhr.responseText
    if @wantHeaders
      headers = 'content-type': @xhr.contentType
    else
      headers = undefined

    metadata = undefined

    if @responseType
      @callback null, text, metadata, headers
      return true

    switch @xhr.contentType
     when 'application/x-www-form-urlencoded'
       @callback null, Dropbox.Util.Xhr.urlDecode(text), metadata, headers
     when 'application/json', 'text/javascript'
       @callback null, JSON.parse(text), metadata, headers
     else
        @callback null, text, metadata, headers
    true

  # Handles the XDomainRequest onload event. (IE 8, 9)
  onXdrError: ->
    # WebKit fires onreadystatechange multiple times, might as well include the
    # same fix in IE-specific code.
    return true if @completed
    @completed = true

    apiError = new Dropbox.ApiError @xhr, @method, @url
    if @onError
      @onError apiError, @callback
    else
      @callback apiError
    return true
