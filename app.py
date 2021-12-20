"""
The flask application package.
"""

from flask import Flask
from datetime import datetime
from flask import render_template,jsonify
from csv import *
import cv2
app = Flask(__name__)



@app.route('/')

@app.route('/home')
def home():
    """Renders the home page."""
    return render_template(
        'index.html',
        title='Home Page',
        year=datetime.now().year,
        app_name='Lyfas Camera Based Health Monitoring',
    )

@app.route('/contact')
def contact():
    """Renders the contact page."""
    return render_template(
        'contact.html',
        title='Contact',
        year=datetime.now().year,
        message='Rupams Contact.',
        app_name='Lyfas Camera Based Health Monitoring',
    )

@app.route('/about')
def about():
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Lyfas Team',
        email='rupam.iics@gmail.com',
        phone='+919845048861',
        app_name='Lyfas Camera Based Health Monitoring',

    )

from flask import request

@app.route('/form')
def form():
    return render_template(
    'form_submit.html',
     year=datetime.now().year,
     app_name='Lyfas Camera Based Health Monitoring',
    
   
    )
@app.route('/fact')
def fact():
    return render_template(
    'factorial_submit.html',
     year=datetime.now().year,
     app_name='Lyfas Camera Based Health Monitoring',
    
   
    )
@app.route('/hello/', methods=['POST'])
def hello():
    name=request.form['yourname']
    email=request.form['youremail']
    return render_template('form_action.html',
                           name=name, 
                           email=email,
                            year=datetime.now().year,
                            app_name='Lyfas Camera Based Health Monitoring',


                           )

@app.route('/factorial/', methods=['POST'])
def factorial():
    number=int(request.form['number'])
    fact1=1
    for i in range(number,1,-1):
        fact1=fact1*i
    return render_template('factorial_action.html',
                           number=str(number), 
                           factorial=fact1,
                            year=datetime.now().year,
                            app_name='Lyfas Camera Based Health Monitoring',


                           )
@app.route('/chart')
def chart(chartID = 'chart_ID', chart_type = 'line', chart_height = 350):
	chart = {"renderTo": chartID, "type": chart_type, "height": chart_height,}
	series = [{"name": 'Series1', "data": [1.1,2.3,3.5]}, {"name": 'Series2', "data": [4, 5, 6]}]
	title = {"text": 'My Title'}
	xAxis = {"categories": ['xAxis Data1', 'xAxis Data2', 'xAxis Data3']}
	yAxis = {"title": {"text": 'yAxis Label'}}
	return render_template(
        'chart.html', 
        chartID=chartID, 
        chart=chart, 
        series=series, 
        title=title, 
        xAxis=xAxis, 
        yAxis=yAxis,
        year=datetime.now().year,
        app_name='Lyfas Camera Based Health Monitoring',
        )

#thins method is working.. displaying a simple chart with python-nvd3
@app.route("/data")
def data():
    #use this while sending a response
    #jdata=jsonify(get_data())
    import json;
    jdata=json.dumps(get_data())
   
    objects = json.loads(jdata)
    rows = list(objects['children'])
    #print(columns.ite)
    good_columns = [
    "symbol",
    "volume",
    "percent_change",
    "net_change" 
    ]
    mydata = []
    xdata=[]
    ydata=[]
    ydata2=[]
    for row in rows:
        selected_row = []
        for item in good_columns:
            selected_row.append(row[item])
        mydata.append(selected_row)
        xdata.append(selected_row[0])
        ydata.append(selected_row[2])
        ydata2.append(selected_row[3])
    import pandas as pd
    #stops = pd.DataFrame(data, columns=good_columns)
    from nvd3 import discreteBarChart
    chart=discreteBarChart(name='Stock Values',title='Stok Values' ,color_category='category20c', height=450, width=900)
    chart.add_serie(ydata,xdata,'Percent Change')
    chart.add_serie(ydata2,xdata,'Net Change')
    
    chart.buildcontent()

    print (chart.htmlcontent)    
    return render_template(
        'stock.html', 
        html_part=chart.htmlcontent,
        scripts=chart.header_js,
        year=datetime.now().year,
        app_name='Lyfas Camera Based Health Monitoring',
        )

#This method is for Creating Bubble chart
@app.route("/data2")
def data2():
   
    return render_template(
        'stock1.html', 
        year=datetime.now().year,
        app_name='Lyfas Camera Based Health Monitoring',
        )

import csv
import requests
URL = "http://www.nasdaq.com/quotes/nasdaq-100-stocks.aspx?render=download"

def get_data():
    r = requests.get(URL)
    data = r.text
    RESULTS = {'children': []}
    for line in csv.DictReader(data.splitlines(), skipinitialspace=True):
        RESULTS['children'].append({
            'name': line['Name'],
            'symbol': line['Symbol'],
            'symbol': line['Symbol'],
            'price': line['lastsale'],
            'net_change': line['netchange'],
            'percent_change': line['pctchange'],
            'volume': line['share_volume'],
            'value': line['Nasdaq100_points']
        })
    return RESULTS

@app.route("/get_data2")
def get_data2():
    r = requests.get(URL)
    data = r.text
    RESULTS = {'children': []}
    for line in csv.DictReader(data.splitlines(), skipinitialspace=True):
        RESULTS['children'].append({
            'name': line['Name'],
            'symbol': line['Symbol'],
            'symbol': line['Symbol'],
            'price': line['lastsale'],
            'net_change': line['netchange'],
            'percent_change': line['pctchange'],
            'volume': line['share_volume'],
            'value': line['Nasdaq100_points']
        })
    return jsonify(RESULTS);

#------------we cam-------------
# Let's declare
centre=[];
@app.route("/get_data3")
def get_data3():
    print('I am here')
    return jsonify(centre);

@app.route('/cam')
def cam():
    return render_template(
        'cam.html',
        title='Web cam',
        
        year=datetime.now().year,
       
        app_name='Lyfas Camera Based Health Monitoring',
    )
###############################
########## Face Tracking############
@app.route('/face_tracking')
def face_tracking():
    return render_template(
                           'pulse_runningFFT2.html',
                           year=datetime.now().year,
                            app_name='Lyfas Camera Based Health Monitoring',
                           )
#############################
@app.route('/face_stat', methods=['GET','POST'])
def face_stat():
    import json
    s=request.form
    str1=''
    
    #tags = request.form['tag_list']
    try:
        ar=json.loads(s['stat'])
        #### Some processing--- Lets calculate centre
        x=int(ar[0]['x'])
        y=int(ar[0]['y'])
        width=int(ar[0]['width'])
        height=int(ar[0]['height'])
        x=x+width/2
        #y=y
        #=y+height/2;
        #str1='x:'+str(ar[0]['x'])+' y:'+str(ar[0]['y'])+' w:'+str(ar[0]['width'])+' h:'+str(ar[0]['height'])
        str1='{"xc":'+str(x)+',"yc":'+str(y)+'}'
        centre.append(json.dumps(str1));
        print(str1)
        
    except:
         str1='{"xc":'+str(-1)+',"yc":'+str(-1)+'}'
         
    resp=flask.Response(json.dumps(str1))

    return resp

@app.route('/favicon.ico')
def favicon():
    import flask
    import os
    return flask.send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')
####### Emotion#######
@app.route('/emotion')
def emotion():
    return render_template(
                           'emotion.html',
                           year=datetime.now().year,
                            app_name='Lyfas Camera Based Health Monitoring',
                           )
######### Traffic accident data analysis
@app.route('/traffic')
def traffic():
    """Renders the about page."""
    import ijson
    import os
   
    
    filename = os.path.realpath('md_traffic.json')
    print(filename)
    with open(filename, 'r') as f:
        objects = ijson.items(f, 'meta.view.columns.item')
        columns = list(objects)
        print(columns[0])

    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='This is Rupams First Flask App.',
        app_name='Lyfas Camera Based Health Monitoring',

    )
from os import environ
from waitress import serve
import os
APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top
APP_STATIC = os.path.join(APP_ROOT, 'static')
from PIL import Image
import requests
from io import BytesIO
import numpy as np;
import os
def detect_faces(image):
    cascade_fname=os.path.join(APP_STATIC, 'haarcascade_frontalface_default.xml')
    faceCascade = cv2.CascadeClassifier(cascade_fname)
    

    #response = requests.get(image)
    #img = Image.open(requests.get(image, stream=True).raw)
    #img = Image.open(BytesIO(response.content))
    img = Image.open(BytesIO(image))
    
    
    img_cv2 = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2RGBA)
    gray = cv2.cvtColor(img_cv2, cv2.COLOR_RGBA2GRAY)
    
    faces = faceCascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE,
        
    )
    try:
        return faces.tolist()
    except:
        return []
@app.route("/prediction", methods=["POST"])
def prediction():
    """
    curl -X POST -v -H "Content-Type: image/png" --data-binary @abba.png http://127.0.0.1:9099/prediction -o foo.jpg
    """
    if request.method == "POST":
        image = request.data
        face_coordinates = detect_faces(image)
        return jsonify(faces=face_coordinates)

@app.route('/opencv_fd')
def opencv_fd():
    return render_template(
                           'cloudcv.html',
                           year=datetime.now().year,
                            app_name='Lyfas Camera Based Health Monitoring',
                           )

if __name__ == '__main__':
    app.run(debug=False)
