 // JavaScript source code
     var resp=0;
    var rav=0, rs0=-100,rs1=-100,rra=0;
    var rpeak=0;

    var lastSeenPeakAt=0.0;
    var rn=-1;
    var respA=0;
    var fwave=0;
    var RR=0;
    var startTimeResp=0;
    var frameCount=0;

    var Features=[];
    var featureDeviation=0;

    function StepResp( rs)
    {
        rn++;

       // rs=frl.step(rs);
        //rs=fr.step(rs);
       // rs=(float)SimpleKalman.update(rs);
        if(rs!=0) {
            if (rs0 == -100) {
                rs0 = rs;
            } else if (rs1 == -100) {

                rs1 = rs;
                rra = (rs1 + rs0) / 2;

            } else {
                rav = (rs1 + rs + rs0) / 3;
                //Parameters.RespirationAmplitude = respA;
                /////// Processing part///////
                if (rs1 > rs0 && rs1 > rav && rs1 > rra)
                {
                    rpeak++;
                    var den = ((new Date()).getTime() - startTimeResp);

                    if (den != 0)
                    {
                        RR = Math.floor ( rpeak * 60 * 1000 / den);

                        rn=0;

                    }


                }
                ///////////////
                rs0 = rs1;
                rs1 = rav;
                rra = (rra + rav) / 2;

            }
        }


        return respA;

    }
                ////////////// Filter Design////////////
                //  Instance of a filter coefficient calculator
var iirCalculator = new Fili.CalcCascades();

// get available filters
var availableFilters = iirCalculator.available();

// calculate filter coefficients
//var firCalculator = new Fili.firCoeffs();
var iirFilterCoeffsLP = iirCalculator.lowpass({
    order: 6, // cascade 3 biquad filters (max: 12)
    characteristic: 'butterworth',
    Fs: 15, // sampling frequency
    Fc: 2.6, // cutoff frequency / center frequency for bandpass, bandstop, peak
    BW: 3.6, // bandwidth only for bandstop and bandpass filters - optional
    gain: 0, // gain for peak, lowshelf and highshelf
    preGain: false // adds one constant multiplication for highpass and lowpass
    // k = (1 + cos(omega)) * 0.5 / k = 1 with preGain == false
  });
                // calculate filter coefficients


// create a filter instance from the calculated coeffs
var iirFilterLP = null;


                /////////////////////////
      var peakCount=0;
    var hrv=0;
    var br=0;


    var ra=0,data=0;
    var pc=0;// percentage to uopdate the ui progressbar
    var min=9999;
    var spo2=98;
    var resp=0;
    var rav=0, rs0=-100,rs1=-100,rra=0;
    var rpeak=0;
    var noFace=0;
    var lastSeenPeakAt=0.0;
    var rn=-1;
    var respA=0;
    var fwave=0;
    var maxima=0.0;
    var s0=-100,s1=-100,s2=-100;
    var elapsed=5;
    var fftStartTime=0;
    var fftSampleRate=0;
    var ampTh=0,elapsedTh=330;
    var Maxima=0,Minima=9999;
        var doScan=false;
      var xc = 0, yc = 0;
      var lastVal=0;
      var startTime=0;
      var v0=0,v1=0,v2=0;
      var yc1=0;
      var myRect={x:-1,y:-1,width:-1,height:-1}
      var lineData = [];
      var dist = 0; //width/10
      var n = 0;// point num
    var smoking_pc=0;
    var diabetic_pc=0;
    var BMI=0;
                ///////// Pulse rate Calculation/////////////
                function Step(Value,pos)
    {


frameCount++;
                var fs=frameCount*1000/((new Date()).getTime()-startTime);
        elapsed=  ((new Date()).getTime()-lastSeenPeakAt);
/*
        System.out.println("TerminalActivity.isFacePulse in alog2="+TerminalActivity.isFacePulse+" value="+Value+" elapsed="+elapsed);
*/



        var s=Value;



        if(s0==-100)
        {
            s0=s;
        }
        else if(s1==-100)
        {

            s1=s;
            ra=(s1+s0)/2;

        }
        else
        {


            var av=(s0+s1+s)/3;
               // av=.9*ra+.1*av;
                //var av= (.49*s0+.49*s1+.02*s);
              //  var av= (.99*s1+.01*s);
               // av=(av+ra)/2;
            if(av<min)
            {
                min=av;
            }

                StepResp(s);
            var condition=s1>s0 && s1>av && elapsed>=elapsedTh && s1>ra ;
       // console.log("s0="+s0+" s1="+s1+" av="+av+" elapsed="+elapsed+" ra="+ra+" condition="+condition);
            if(condition)
            {


                hasPeak=true;

                elapsed=0;
                /// New Mod////
                               ////////
                maxima=s1;


                lastSeenPeakAt=(new Date()).getTime();


                /// Spo2......
                if(min!=0)
                {
                    var spo21=100-((maxima-min)/Math.abs(min));
                    spo21=~~(spo21+spo2)/2;
                    if(spo21>88)
                    {
                      spo2=spo21;
                    }
                    else
                    {
                     spo2=98;
                    }
                }
                //respiratory...
               // ra=(ra+av)/2;

                if(peakCount==0)
                {
                startTime=(new Date()).getTime();
                }

                peakCount++;

/*
                    System.out.println("-----> peaks:"+peakCount+" elapsed: "+(System.currentTimeMillis()-startTime) );
*/
                if( ( (new Date()).getTime()-startTime)>=20000)
                {
                    //int spo2=(int)(s1*100/av);


                    // Parameters.SPO2=(Parameters.SPO2+spo2)/2;
                    var den=((new Date()).getTime()-startTime)-wastedTime;
                    wastedTime=0;
                    if(den!=0)
                    {
                        var bpm =  ~~(60 * 1000 * ((peakCount )) / den);


                        var IBI= Math.floor(60*1000/bpm);
                        var hrvPc=0;
                        if(hrv>0)
                        {
                        hrv=Math.floor(Math.abs(IBI-hrv)*100/IBI);
                        }
                        hrv=IBI;


                 if(IBI<2000 && hrvPc<30 )
                {
            //    iirFilterLP.reinit();


        if(sr>10)
        {
        $("#stat").text("❤: "+bpm+" bpm Spo2: %"+spo2 +" IBI="+IBI+" ms"+" HRV="+hrvPc+"% Breath Rate="+Math.floor(RR/5)+" bpm ✓"  );
        }
        else
        {
        if(bpm>50)
        $("#stat").text("❤: "+bpm+" bpm Spo2: %"+spo2 +" IBI="+IBI+" ms"+" HRV="+hrvPc+"% Breath Rate="+Math.floor(RR/5)+" bpm ✓(* Low FPS)"  );
        else
        $("#stat").text("Measurement Failed! Retrying..");
        // $("#stat").text("❤: "+bpm+" bpm Spo2: "+spo2 +"% 🚬:" +Math.round( (lip_black)*100)+"% Diabetese Chances="+Math.round((1-red_cap)*100)+"% BMI="+Math.round((pos[12][0]-pos[37][0])*31.0/(pos[7][1]-pos[37][1]))+" IBI="+IBI+" ms"+" HRV="+hrvPc+"% Breath Rate="+Math.floor(RR/5)+" bpm ✓"  );

        }

                }
                       // hrv=0;


        //doScan=false;
          //document.getElementById("btnScan").style.visibility = "visible";
   // document.body.appendChild(canvas);
        // window.open(canvas.toDataURL("image/png"), '_blank');
         //alert("Scan Complete... Take a Screenshot of this Page");

                    }
                }
                else
                {

                    pc=(5*((new Date()).getTime()-startTime)/1000);
                    if(pc>100)
                    {
                        pc=100;
                    }
        document.getElementById("prg").value = ""+pc;

                }

                elapsed=0;

            }
            else
            {
                elapsed++;
            }
            //ra=(.99*ra+.01*av)/2;

            s0=s1;

            ra=(ra+ av)/2;

            s1 = av;
            av=ra;

        }



        return ra;

    }

     function median(values)
          {

    values.sort();
    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
          }

                //////// Facial Statistics/////////////////
                //1. face
                //2. Left eye
                //3. Right Eye
                //4. nose
                //5. Upper Lips
                //6. Teeth
                //7. Lower lips
               var  face_part ={r:0,g:0,b:0,c:0};
                var lips={r:0,g:0,b:0,c:0,black:1,pink:0}
                var chin={r:0,g:0,b:0,c:0}
               var  forehead={r:0,g:0,b:0,c:0}
               var left_chick={r:0,g:0,b:0,c:0}
               var  right_chick={r:0,g:0,b:0,c:0}
               var  nose={r:0,g:0,b:0,c:0}
               var  left_eye={r:0,g:0,b:0,c:0,red:0,white:1,black:1}
               var  right_eye={r:0,g:0,b:0,c:0}
                var pk=0;
                var Processed=[];
                var Gathered=[];
                var avfft=[];
                var bpmF=72;
                function ProcessSignalWithFFT(sr)
                {
                var fft = new Fili.Fft(128);
                var fftr = fft.forward(Gathered, 'hamming');
              var  L=128;
                var fhigh=sr/2-sr/10;
                if(fhigh>2.5)
                {
                fhigh=2.5;
                }
                var flow=.6
              var sl=Math.ceil(L*flow/sr)-1;
              var shigh=Math.ceil(L*fhigh/sr)-1;

              var el=L-shigh+1;
                var ehigh=L-sl+1;
                var im=[];
                var re=[];
                var maxA=0;
                var maxF=0;
                for(i=0;i<128;i++)
                {
                if(i<=sl || i>=ehigh ||(i>=shigh && i<=el)&&i!=0 &&i!=127)
                {
                fftr.re[i]=0;
                fftr.im[i]=0;
                }
                if(avfft.length<128)
                {
                avfft.push({re:fftr.re[i],im:fftr.im[i]});

                }
                else
                {
                avfft[i].re=(fftr.re[i]+avfft[i].re)/2;
                avfft[i].im=(fftr.im[i]+avfft[i].im)/2;
                }

                re[i]=avfft[i].re;
                im[i]=avfft[i].im;
                if(Math.abs(re[i]>maxA) &&(i>2 && i<62))
                {
                maxA=Math.abs(re[i]);
                maxF=i-1;
                }
                }
                /// IFFT

                var Gathered1 = fft.inverse(re, im);
                maxF=sr*maxF/128;
                bpmF=60*maxF;
                 for(i=0;i<128;i++)
                {
                av=Gathered1[i];

                Processed.push(av);

                }
                Gathered=[];
                }
                var iirFilterLP=null;
                var wastedTime=0;
                function ProcessSignalWithIIR(value,sr)
                {
                var st=(new Date()).getTime();

                if(iirFilterLP==null)
                {
                 var iirFilterCoeffsLP = iirCalculator.lowpass({
    order: 2, // cascade 3 biquad filters (max: 12)
    characteristic: 'butterworth',
    Fs: sr, // sampling frequency
    Fc: 3.4, // cutoff frequency / center frequency for bandpass, bandstop, peak
    BW: 3.6, // bandwidth only for bandstop and bandpass filters - optional
    gain: 0, // gain for peak, lowshelf and highshelf
    preGain: false // adds one constant multiplication for highpass and lowpass
    // k = (1 + cos(omega)) * 0.5 / k = 1 with preGain == false
  });
                // calculate filter coefficients


// create a filter instance from the calculated coeffs
iirFilterLP = new Fili.IirFilter(iirFilterCoeffsLP);
                }
           //      Gathered=iirFilterLP.multiStep(Gathered);
                value=iirFilterLP.singleStep(value);
               wastedTime=wastedTime+ (new Date()).getTime()-st;
                return value;
                }
                var firFilter=null;
               function ProcessSignal(value,sr)
                {



                ////////**** Try Fir/////
                if(firFilter==null)
                {
                var firCalculator = new Fili.FirCoeffs();

                // calculate filter coefficients
                var firFilterCoeffs = firCalculator.lowpass
                ({
                order: 10, // filter order
                Fs: sr, // sampling frequency
                Fc: 4.2 // cutoff frequency
                 // forbandpass and bandstop F1 and F2 must be provided instead of Fc
                });

                // filter coefficients by Kaiser-Bessel window
                var fb=sr/2-sr/10;
                if(fb>3.3)
                {
                fb=3.3;
                }
                var firFilterCoeffsK = firCalculator.kbFilter
                ({
                order: 117, // filter order (must be odd)
                Fs: sr, // sampling frequency
                Fa: .8, // rise, 0 for lowpass
                Fb: fb, // fall, Fs/2 for highpass
                Att: -10 // attenuation in dB
                });

                // create a filter instance from the calculated coeffs
                firFilter = new Fili.FirFilter(firFilterCoeffsK);
                }
               // var Gathered1=firFilter.multiStep(Gathered);
                value=firFilter.singleStep(value);
                return value;

                }
                var sr=-1;
                var ssr=-1;
                var fc=0;
     function getAverageRGB(canvas,context,pos)
                {

    var blockSize = 1, // only visit every 5 pixels


        data, width, height,
        i = -4,
        length,

        count = 0;

    if (!context) {
        return 0;
    }
                  height = canvas.height ;//= imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width ;//= imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

   // context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height,pos);
    } catch(e) {
        /* security error, img on diff domain */
        return 0;
    }

    length = data.data.length;
                x=0;
                y=0;
                face_part ={r:0,g:0,b:0,c:0};
                lips={r:0,g:0,b:0,c:0,black:1,pink:0}
                chin={r:0,g:0,b:0,c:0}
                forehead={r:0,g:0,b:0,c:0}
                left_chick={r:0,g:0,b:0,c:0}
                right_chick={r:0,g:0,b:0,c:0}
                nose={r:0,g:0,b:0,c:0}
                left_eye={r:0,g:0,b:0,c:0,red:0,white:1,black:1}
                right_eye={r:0,g:0,b:0,c:0}
                var extra=0;
    while ( (i += blockSize * 4) < length )
                {
               // data.data[i+1]=255-data.data[i+1];
                var matched=false;
                var myRect={x:0,y:0,width:0,height:0}
                   // Left eye.... Black part RGB<100, white part rgb >100, red part r>g,b and r>100
                 var extra=(pos[27][0]-pos[23][0])/2;
                myRect.x=pos[23][0]-extra/2;
                myRect.y=pos[24][1];
                myRect.height=pos[25][1]+extra/2-myRect.y
                myRect.width=pos[25][0]+extra/2-myRect.x
                if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height))
                {

                left_eye.r+=data.data[i+2];

                left_eye.g+=data.data[i+1];
                left_eye.b+=data.data[i];
                left_eye.c++;
                matched=true;

                if(left_eye.r>110 && left_eye.g>110 && left_eye.b> 110)
                {
                    if(left_eye.r>(left_eye.g +left_eye.b)/2)
                    {
                    left_eye.red++;
                    }
                    else
                    {
                    left_eye.white++;
                    }
                    if(left_eye.r<70 && left_eye.g<70 && left_eye.b< 70)
                    {
                    left_eye.black++;
                    }

                }
                }

                 ///// Right Eye////
                extra=(pos[28][0]-pos[32][0])/2;
                myRect.x=pos[30][0]-extra/2;
                myRect.y=pos[29][1];
                myRect.height=pos[31][1]-myRect.y
                myRect.width=pos[28][0]+extra/2-myRect.x

                if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height))
                {
                right_eye.r+=data.data[i+2];
                right_eye.g+=data.data[i+1];
                right_eye.b+=data.data[i];
                right_eye.c++;
                matched=true;
                }
                //////////////// nose//////////////
                extra=(pos[62][0]-pos[35][0])/2;
                myRect.x=pos[35][0]-extra/2;
                myRect.y=pos[34][1];
                myRect.height=pos[35][1]+extra-myRect.y
                myRect.width=pos[39][0]+extra/2-myRect.x

                if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height))
                {
                nose.r+=data.data[i+2];
                nose.g+=data.data[i+1];
                nose.b+=data.data[i];
                nose.c++;
                matched=true;
                }
                //////////////////// forehead//////////////////////
                myRect.x=pos[22][0];
                myRect.y=pos[22][1]-(pos[31][1]-pos[17][1]);
                myRect.height=(pos[31][1]-pos[17][1])
                myRect.width=pos[18][0]-myRect.x
                if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height) )
                {
                forehead.r+=data.data[i+2];
                forehead.g+=data.data[i+1];
                forehead.b+=data.data[i];
                forehead.c++;
                matched=true;
                }
                ///////////////////// lips/////////////
                //// Lips
                myRect.x=pos[26][0];
                myRect.y=pos[37][1]+.9*(pos[47][1]-pos[37][1]);
                myRect.height=pos[52][1]-myRect.y
                myRect.width=pos[70][0]-myRect.x
                if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height))
                {
                lips.r+=data.data[i+2];
                lips.g+=data.data[i+1];
                lips.b+=data.data[i];
                lips.c++;
                    if(data.data[i+2]>130)
                    {
                    lips.pink++;
                    }
                    else
                    {
                    lips.black++;
                    }
                    matched=true
                }
                //////////////////////// Chin
                myRect.x=pos[55][0];
                myRect.y=pos[54][1];
                myRect.height=pos[6][1]-myRect.y
                myRect.width=pos[51][0]-myRect.x

               if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height))
                {
                chin.r+=data.data[i+2];
                chin.g+=data.data[i+1];
                chin.b+=data.data[i];
                chin.c++;
                matched=true
                ////////////////////
                }

                ////// Left Chick/////
                myRect.x=pos[19][0];
                myRect.y=pos[26][1];
                myRect.height=(pos[4][1]-myRect.y)
                myRect.width=pos[44][0]-myRect.x
               if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height))
                {
                left_chick.r+=data.data[i+2];
                left_chick.g+=data.data[i+1];
                left_chick.b+=data.data[i];
                left_chick.c++;
                matched=true
                }
                ////////////////////////// Right Check////////////////////////////
                 myRect.x=pos[50][0];
                myRect.y=pos[31][1];
                myRect.height=(pos[50][1]-myRect.y)
                myRect.width=pos[11][0]-myRect.x
               if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height))
                {
                right_chick.r+=data.data[i+2];
                right_chick.g+=data.data[i+1];
                right_chick.b+=data.data[i];
                right_chick.c++;
                matched=true;
                }
                if(!matched)
                {
                face_part.r += data.data[i+2];
        face_part.g += data.data[i+1];
        face_part.b += data.data[i];
                face_part.c++;
                }

        ++count;
                x++;
                if(x>=width)
                {
                x=0;
                y++;
                }

    }
                face_part.r=face_part.r/face_part.c;
                face_part.g=face_part.g/face_part.c;
                face_part.b=face_part.b/face_part.c;

                lips.r=lips.r/lips.c;
                lips.g=lips.g/lips.c;
                lips.b=lips.b/lips.c;

                left_chick.r=left_chick.r/left_chick.c;
                left_chick.g=left_chick.g/left_chick.c;
                left_chick.b=left_chick.b/left_chick.c;

                nose.r=nose.r/nose.c;
                nose.g=nose.g/nose.c;
                nose.b=nose.b/nose.c;

                forehead.r=forehead.r/forehead.c;
                forehead.g=forehead.g/forehead.c;
                forehead.b=forehead.b/forehead.c;

                chin.r=chin.r/chin.c;
                chin.g=chin.g/chin.c;
                chin.b=chin.b/chin.c;

                left_eye.r=left_eye.r/left_eye.c;
                left_eye.g=left_eye.g/left_eye.c;
                left_eye.b=left_eye.b/left_eye.c;

                right_eye.r=right_eye.r/right_eye.c;
                right_eye.g=right_eye.g/right_eye.c;
                right_eye.b=right_eye.b/right_eye.c;

                //var m=median([left_chick.r ,left_chick.g ,right_chick.r ,right_chick.g ,forehead.r ,forehead.g, face_part.r ,face_part.g]);
                //var m=median([nose.g ,left_chick.g , ,right_chick.g ,,forehead.g,face_part.g]);
               // console.log( (new Date()).getTime()+","+nose.g+","+nose.r+","+left_chick.g+","+left_chick.r+","+right_chick.g+","+right_chick.r+","+forehead.g+","+face_part.g+","+face_part.b);
               // m=Math.abs(forehead.g-forehead.b);
                m=nose.g;
                return m;
                //return median([forehead.g,forehead.r,chin.r,chin.g,nose.r,nose.g,left_chick.r,left_chick.g]);
    // ~~ used to floor values

                /*
        var av=(rgb.r+rgb.g+rgb.b)/3;
    rgb.r = Math.abs((rgb.r-av)/count);
    rgb.g = Math.abs( (rgb.g)/count);
    rgb.b = Math.abs((rgb.b)/count);

    return rgb;

                */

}
        function getAverageRGBNew(canvas,context,pos,width,height)
                {

    var blockSize = 1, // only visit every 5 pixels



        i = -4,
        length,

        count = 0;

    if (!context)
    {
        return 0;
    }
    if(extraParams)
    {
    height = canvas.height ;//= imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width ;//= imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
    }

   // context.drawImage(imgEl, 0, 0);

    try
    {
        data = context.getImageData(0, 0, width, height,pos);
    } catch(e) {
        /* security error, img on diff domain */
        return 0;
    }

    length = data.data.length;
                x=0;
                y=0;
                face_part ={r:0,g:0,b:0,c:0};
                lips={r:0,g:0,b:0,c:0,black:1,pink:0}
                chin={r:0,g:0,b:0,c:0}
                forehead={r:0,g:0,b:0,c:0}
                left_chick={r:0,g:0,b:0,c:0}
                right_chick={r:0,g:0,b:0,c:0}
                nose={r:0,g:0,b:0,c:0}
                left_eye={r:0,g:0,b:0,c:0,red:0,white:1,black:1}
                right_eye={r:0,g:0,b:0,c:0}
                var extra=0;
            if(extraParams)
                {
                while ( (i += blockSize * 4) < length )
                {

               // data.data[i+1]=255-data.data[i+1];
                var matched=false;
                var myRect={x:0,y:0,width:0,height:0}
                   // Left eye.... Black part RGB<100, white part rgb >100, red part r>g,b and r>100
                 var extra=(pos[27][0]-pos[23][0])/2;
                myRect.x=pos[23][0]-extra/2;
                myRect.y=pos[24][1];
                myRect.height=pos[25][1]+extra/2-myRect.y
                myRect.width=pos[25][0]+extra/2-myRect.x
                if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height))
                {

                left_eye.r+=data.data[i+2];

                left_eye.g+=data.data[i+1];
                left_eye.b+=data.data[i];
                left_eye.c++;
                matched=true;

                if(left_eye.r>110 && left_eye.g>110 && left_eye.b> 110)
                {
                    if(left_eye.r>(left_eye.g +left_eye.b)/2)
                    {
                    left_eye.red++;
                    }
                    else
                    {
                    left_eye.white++;
                    }
                    if(left_eye.r<70 && left_eye.g<70 && left_eye.b< 70)
                    {
                    left_eye.black++;
                    }

                }
                }

                 //////////////// nose//////////////
                extra=(pos[62][0]-pos[35][0])/2;
                myRect.x=pos[35][0]-extra/2;
                myRect.y=pos[34][1];
                myRect.height=pos[35][1]+extra-myRect.y
                myRect.width=pos[39][0]+extra/2-myRect.x

                if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height))
                {
                nose.r+=data.data[i+2];
                nose.g+=data.data[i+1];
                nose.b+=data.data[i];
                nose.c++;
                matched=true;
                }

                ///////////////////// lips/////////////
                //// Lips
                myRect.x=pos[26][0];
                myRect.y=pos[37][1]+.9*(pos[47][1]-pos[37][1]);
                myRect.height=pos[52][1]-myRect.y
                myRect.width=pos[70][0]-myRect.x
                if(x>=myRect.x && x< (myRect.x+myRect.width) && y>=myRect.y && y< (myRect.y+myRect.height))
                {
                lips.r+=data.data[i+2];
                lips.g+=data.data[i+1];
                lips.b+=data.data[i];
                lips.c++;
                    if(data.data[i+1]>120 && data.data[i+1]>data.data[i+2])
                    {
                    lips.pink++;
                    }
                    else
                    {
                    lips.black++;
                    }
                    matched=true
                }

        ++count;
                x++;
                if(x>=width)
                {
                x=0;
                y++;
                }

    }


                lips.r=lips.r/lips.c;
                lips.g=lips.g/lips.c;
                lips.b=lips.b/lips.c;



                nose.r=nose.r/nose.c;
                nose.g=nose.g/nose.c;
                nose.b=nose.b/nose.c;


                left_eye.r=left_eye.r/left_eye.c;
                left_eye.g=left_eye.g/left_eye.c;
                left_eye.b=left_eye.b/left_eye.c;


                m=nose.g;

 var lip_black=Math.abs( (lips.pink-lips.black)/(lips.black+lips.pink+1));
        var red_cap=Math.abs((left_eye.white-left_eye.red)/(left_eye.white+left_eye.red+1));
smoking_pc=smoking_pc+Math.round( (lip_black)*100);
diabetic_pc=diabetic_pc+Math.round((1-red_cap)*100);
BMI=BMI+Math.round((pos[12][0]-pos[37][0])*31.0/(pos[7][1]-pos[37][1]));

$("#extras").text(" 🚬:" +smoking_pc+"% Diabetese Chances?="+diabetic_pc+"% BMI="+BMI);
                        peakCount = 0;

                        BMI=0;
                        diabetic_pc=0;
                        smoking_pc=0;
                        pc = 100;
                        startTime = (new Date()).getTime();
                        framecount=0;
                        extraParams=false;


                return m;
            }
            else
            {
            while ( (i += blockSize * 4) < length )
                {
                forehead.r+=data.data[i+2];
                forehead.g+=data.data[i+1];
                forehead.b+=data.data[i];
                forehead.c++;
                }
                forehead.r=forehead.r/forehead.c;
                forehead.g=forehead.g/forehead.c;
                forehead.b=forehead.b/forehead.c;


             // m=nose.g;
                m=forehead.g;
                return m;
            }
                //return median([forehead.g,forehead.r,chin.r,chin.g,nose.r,nose.g,left_chick.r,left_chick.g]);
    // ~~ used to floor values

                /*
        var av=(rgb.r+rgb.g+rgb.b)/3;
    rgb.r = Math.abs((rgb.r-av)/count);
    rgb.g = Math.abs( (rgb.g)/count);
    rgb.b = Math.abs((rgb.b)/count);

    return rgb;

                */

}
                /////// My Porting///////////////////////////
                //var face_canvas=document.getElementById('face');
         var face_canvas = document.createElement('canvas');
        var face_context=null;
                myRect={x:-1,y:-1,width:-1,height:-1}
                var extraParams=false;
                function positionLoop(positions1)
                {
                //0 is x and 1 is y positions[0][0], positions[0][1]
                //1. Face Rectangle


                var wd=vid.videoWidth;
                var he=vid.videoHeight;
                var wd1=overlay.width;
                var he1=overlay.height;
                var scaleX=wd/wd1;
                var scaleY=he/he1;
                var pos=[];

                for (var i = 0; i < 71; i++)
			            {
                pos[i]=[positions1[i][0]*scaleX,positions1[i][1]*scaleY];


			            }
                   ///// Original
                myRect.x=pos[1][0];
                myRect.y=pos[20][1]-(pos[7][1]-pos[52][1]);
                myRect.height=pos[7][1]-myRect.y
                myRect.width=pos[13][0]-myRect.x



                /*
                  // Left eye.... Black part RGB<100, white part rgb >100, red part r>g,b and r>100
                 var extra=(pos[27][0]-pos[23][0])/2;
                myRect.x=pos[23][0]-extra/2;
                myRect.y=pos[24][1];
                myRect.height=pos[25][1]+extra/2-myRect.y
                myRect.width=pos[25][0]+extra/2-myRect.x
                */
                /* ///// Right Eye////
                var extra=(pos[28][0]-pos[32][0])/2;
                myRect.x=pos[30][0]-extra/2;
                myRect.y=pos[29][1];
                myRect.height=pos[31][1]-myRect.y
                myRect.width=pos[28][0]+extra/2-myRect.x

                */
                /* //// Lips
                myRect.x=pos[26][0];
                myRect.y=pos[37][1]+.9*(pos[47][1]-pos[37][1]);
                myRect.height=pos[52][1]-myRect.y
                myRect.width=pos[70][0]-myRect.x
                */
                /*  /// Chin
                myRect.x=pos[55][0];
                myRect.y=pos[54][1];
                myRect.height=pos[6][1]-myRect.y
                myRect.width=pos[51][0]-myRect.x
                */
                /*
                myRect.x=pos[55][0];
                myRect.y=pos[54][1];
                myRect.height=pos[6][1]-myRect.y
                myRect.width=pos[51][0]-myRect.x
                */
                /*  forehead
                myRect.x=pos[20][0];
                myRect.y=pos[20][1]-(pos[31][1]-pos[17][1]);
                myRect.height=(pos[31][1]-pos[17][1])
                myRect.width=pos[16][0]-myRect.x
                */
                /* // left chick(actual image right)
                myRect.x=pos[19][0];
                myRect.y=pos[26][1];
                myRect.height=(pos[4][1]-myRect.y)
                myRect.width=pos[44][0]-myRect.x
                */
                /* //right chick
                myRect.x=pos[50][0];
                myRect.y=pos[31][1];
                myRect.height=(pos[50][1]-myRect.y)
                myRect.width=pos[11][0]-myRect.x
                */
        if(face_context==null)
        {
    face_canvas.height = vid.videoHeight;
    face_canvas.width = vid.videoWidth;
    face_context = face_canvas.getContext('2d');
        }
        /*
    if(!extraParams)// draw only nose
    {
 ///// Forehead Part/////
               myRect.x=pos[20][0];
                myRect.y=pos[20][1]-(pos[31][1]-pos[17][1]);
                myRect.height=(pos[31][1]-pos[17][1])
                myRect.width=pos[16][0]-myRect.x

    face_context.drawImage(vid, myRect.x,myRect.y,myRect.width,myRect.height,0,0,myRect.width, myRect.height);
    }
    else
    {
    face_context.drawImage(vid, 0,0,vid.videoWidth,vid.videoHeight,0,0,face_canvas.width, face_canvas.height);
    }*/
        //face_context.drawImage(vid, myRect.x,myRect.y,myRect.width,myRect.height,0,0,face_canvas.width, face_canvas.height);
                //// Get the Color Values
             //  var m=getAverageRGBNew(face_canvas,face_context,pos,myRect.width,myRect.height);
        var p1=pos[47][1]-Math.ceil(pos[37][1]);

        //m=parseFloat((pos[41][1]/10+"").split(".")[1].substring(0,3));
        m=p1*10;
        //var m=20;
                fc++;
                ////////////////// Process face part for pulse////
        if(m!=0)
        {
       // var av=(face_part.r+face_part.g+face_part.b)/3;
        //face_part.r=Math.abs(face_part.r-av);
        //yc1=parseFloat((face_part.r/10+"").split(".")[1].substring(0,3));
        //yc1=parseFloat((m/10+"").split(".")[1].substring(0,3));
        //yc1=parseFloat((m/100+"").split(".")[1].substring(0,3));
                yc1=m;
        //yc2=iirFilterLP.singleStep(yc1);
                /* For FFT Technique
                if(Gathered.length<=1)
                {
                fftStartTime=(new Date()).getTime();
                }
                if(Gathered.length>=128)
                {
                var el=(new Date()).getTime()-fftStartTime;

                if(sr==-1)
                {
                sr=Math.ceil(128*1000/el);
                }

                ProcessSignal(sr);
                }
                Gathered.push(yc1);
                */
        ///////////
                //do lpf
        ////////////
     //  console.log("red value="+rgb.r +" dec part:"+yc1 +" post filtering"+ (yc2)+" vo="+v0+" v1="+v1+" v2="+v2);
      //  console.log(new Date().getTime()-startTime+","+yc1);
        //yc1=yc2;
        // yc1=m;

        /////////Tracking ends/////////
                if(fc==1)
                {
                fftStartTime=(new Date()).getTime();
                }
                if(fc>=30)//Processed.length>0  <- FFT
                {

                //var yc2=Math.abs(Processed.pop());
                var el=(new Date()).getTime()-fftStartTime;
                sr=Math.ceil(fc*1000/el);
                if(ssr==-1)
                {
                ssr=sr;
                //extraParams=true;
              //  var m=getAverageRGBNew(face_canvas,face_context,pos,myRect.width,myRect.height);
              //  pc=0;

                }

                //var yc2=ProcessSignal(yc1,sr);
               yc2=ProcessSignalWithIIR(yc1,sr)
               // yc2=yc1;
                if(startTime==0)
                {

                    startTime=(new Date()).getTime();
                    farmeCount=0;

                }
                var avY=Step(yc2,pos);
              //  console.log((new Date()).getTime()+","+m+","+yc1+","+yc2+","+avY);
                              //StepResp( nose.g); useful for BP


                        if(true)//Math.abs(avY)<=5
                            {
                               if (lineData.length > sr*50)
                               {
                                   lineData=[];
                                    n=0;
                               }
                               if(true)//avY>-50 && avY<50
                                {
                               lineData.push({ x: xc, y: avY, r: avY, num: n })
                                n++
                                }

                               InitChart();
                            }
                               //scatterPlot();

                }
        }
                /////////////////////////

                }
                ///////////////////////////////////////////
			    var vid = document.getElementById('videoel');
			    var overlay = document.getElementById('overlay');
			    var overlayCC = overlay.getContext('2d');

			    /********** check and set up video/webcam **********/

			    function enablestart() {
			        var startbutton = document.getElementById('startbutton');
			        startbutton.value = "start";
			        startbutton.disabled = null;
			    }

			    /*var insertAltVideo = function(video) {
					if (supports_video()) {
						if (supports_ogg_theora_video()) {
							video.src = "../media/cap12_edit.ogv";
						} else if (supports_h264_baseline_video()) {
							video.src = "../media/cap12_edit.mp4";
						} else {
							return false;
						}
						//video.play();
						return true;
					} else return false;
				}*/
			    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
			    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

			    // check                 camerasupport
			    if (navigator.getUserMedia) {
			        // set up stream

			        var videoSelector = { video: true };
			        if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
			            var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
			            if (chromeVersion < 20) {
			                videoSelector = "video";
			            }
			        };

			        navigator.getUserMedia(videoSelector, function (stream) {
			            if (vid.mozCaptureStream) {
			                vid.mozSrcObject = stream;
			            } else {
			                vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;

			            }
			            vid.play();
			        }, function () {
			            //insertAltVideo(vid);
			            alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
			        });
			    } else {
			        //insertAltVideo(vid);
			        alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
			    }

			    vid.addEventListener('canplay', enablestart, false);

			    /*********** setup of emotion detection *************/

			    var ctrack = new clm.tracker({ useWebGL: true });
			    ctrack.init(pModel);
                var ec = new emotionClassifier();
				ec.init(emotionModel);
				var emotionData = ec.getBlank();

                delete emotionModel['disgusted'];
				delete emotionModel['fear'];
			    /****************************************/
                ////////////////////////////////////////
			    function startVideo() {
			        // start video
			        vid.play();
			        // start tracking
			        ctrack.start(vid);
			        // start loop to draw face
    			        drawLoop();
                    startTimeResp=(new Date()).getTime();


			    }
                var score=.5;
			    function drawLoop() {
			        requestAnimFrame(drawLoop);
			        overlayCC.clearRect(0, 0, 400, 300);
			        //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
			    var positions = ctrack.getCurrentPosition();
                if (positions)
                    {
                        var face_length=positions[7][1]-positions[33][1];
                        score=(.99*score+.01*ctrack.getScore());
                        if(face_length>=60 && face_length<=150 ) //&& score>=.5
                        {
			            ctrack.draw(overlay);
                        positionLoop(positions);//Cal
                        }
			        }

			        var cp = ctrack.getCurrentParameters();


			        var er = ec.meanPredict(cp);

			        if (er)
                        {

			         //   updateData(er);
			                var data = '';
			                for (var i = 0; i < er.length; i++)
			                {
			                    data = data + er[i].value + '#';
			                    if (er[i].value > 0.4)
                                {
			                        document.getElementById('icon' + (i + 1)).style.visibility = 'visible';
			                    }
                                else
                                {
			                    document.getElementById('icon' + (i + 1)).style.visibility = 'hidden';
			                    }
			                 }

			              }

			    }

			    var ec = new emotionClassifier();
			    ec.init(emotionModel);
			    var emotionData = ec.getBlank();

			    // ************ d3 code for barchart ***************** //
        /*
			    var margin = { top: 20, right: 20, bottom: 10, left: 40 },
					width = 400 - margin.left - margin.right,
					height = 100 - margin.top - margin.bottom;

			    var barWidth = 30;

			    var formatPercent = d3.format(".0%");

			    var x = d3.scale.linear()
					.domain([0, ec.getEmotions().length]).range([margin.left, width + margin.left]);

			    var y = d3.scale.linear()
					.domain([0, 1]).range([0, height]);

			    var svg = d3.select("#emotion_chart").append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)

			    svg.selectAll("rect").
				  data(emotionData).
				  enter().
				  append("svg:rect").
				  attr("x", function (datum, index) { return x(index); }).
				  attr("y", function (datum) { return height - y(datum.value); }).
				  attr("height", function (datum) { return y(datum.value); }).
				  attr("width", barWidth).
				  attr("fill", "#2d578b");

			    svg.selectAll("text.labels").
				  data(emotionData).
				  enter().
				  append("svg:text").
				  attr("x", function (datum, index) { return x(index) + barWidth; }).
				  attr("y", function (datum) { return height - y(datum.value); }).
				  attr("dx", -barWidth / 2).
				  attr("dy", "1.2em").
				  attr("text-anchor", "middle").
				  text(function (datum) { return datum.value; }).
				  attr("fill", "white").
				  attr("class", "labels");

			    svg.selectAll("text.yAxis").
				  data(emotionData).
				  enter().append("svg:text").
				  attr("x", function (datum, index) { return x(index) + barWidth; }).
				  attr("y", height).
				  attr("dx", -barWidth / 2).
				  attr("text-anchor", "middle").
				  attr("style", "font-size: 12").
				  text(function (datum) { return datum.emotion; }).
				  attr("transform", "translate(0, 18)").
				  attr("class", "yAxis");

			    function updateData(data) {
			        // update
			        var rects = svg.selectAll("rect")
						.data(data)
						.attr("y", function (datum) { return height - y(datum.value); })
						.attr("height", function (datum) { return y(datum.value); });
			        var texts = svg.selectAll("text.labels")
						.data(data)
						.attr("y", function (datum) { return height - y(datum.value); })
						.text(function (datum) { return datum.value.toFixed(1); });

			        // enter
			        rects.enter().append("svg:rect");
			        texts.enter().append("svg:text");

			        // exit
			        rects.exit().remove();
			        texts.exit().remove();
			    }
        */
			    /******** stats ********/

			    stats = new Stats();
			    stats.domElement.style.position = 'absolute';
			    stats.domElement.style.top = '0px';
			    document.getElementById('container').appendChild(stats.domElement);

			    // update stats on every iteration
			    document.addEventListener('clmtrackrIteration', function (event) {
			        stats.update();
			    }, false);
                function InitChart() {
          //alert('Line chart Demo')

          d3.selectAll("svg > *").remove();
          var vis = d3.select('#chart'),
         WIDTH = 300,
          HEIGHT = 120,
          MARGINS = {
              top: 20,
              right: 20,
              bottom: 20,
              left: 0
          },
          xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function (d) {
              return 0;
          }), d3.max(lineData, function (d) {
              return lineData.length;
          })]),
          yRange = d3.scale.linear().range([ MARGINS.top,HEIGHT - MARGINS.bottom]).domain([d3.min(lineData, function (d) {
              return d.r;
          }), d3.max(lineData, function (d) {
              return d.r;
          })]),
          xAxis = d3.svg.axis()
            .scale(xRange)
            .tickSize(10)
            .tickSubdivide(true),
          yAxis = d3.svg.axis()
            .scale(yRange)
            .tickSize(10)
            .orient('left')
            .tickSubdivide(true);

          vis.append('svg:g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
            .call(xAxis);

          vis.append('svg:g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
            .call(yAxis);

          var lineFunc = d3.svg.line()
          .x(function (d) {
              return xRange(d.num);
          })
          .y(function (d) {
              return yRange(d.r);
          })
          .interpolate('linear');

          vis.append('svg:path')
          .attr('d', lineFunc(lineData))
          .attr('stroke', 'blue')
          .attr('stroke-width', 2)
          .attr('fill', 'none');
      }
