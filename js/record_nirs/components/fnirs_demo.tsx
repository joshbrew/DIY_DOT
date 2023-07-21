import React, {Component} from 'react'
import { WGLPlotter } from '../webglplot/plotter';

let ledGPIO = [ 
    //37, 38, 255

    255, //ambient
    //10, 30, 9 //12, 13, 11 //2 channel hookup

    //16 channel hookup
    // 10, 109,
    14, 107,
    // 114, 17,
    // 100,  6,
    // 115, 21,
    16,  24,
    5,   31,
    // 8,    7,
    // 111, 104
] //255 is ambient

export class FNIRSDemo extends Component<{[key:string]:any}> {

    unique = Math.floor(Math.random()*1000000000000000);

    canvas = document.createElement('canvas');
    overlay = document.createElement('canvas');
    plotter:WGLPlotter;
    recording = false;
    created = false;

    
    useSingleChannel = true;
    selectedChannel = 0;


    ambientCorrection = true;

    nLEDs = ledGPIO.length;
    LEDctr = 0;

    lastResult = {} as any;

    assignments = {
        ambient:{255:true},
        red:{14:true, 16:true, 5:true},
        infrared:{107:true, 24:true, 31:true}
    };

    values = {
        ambient:0,
        red:0,
        infrared:0,
        heg:0
    };

    target = 'ambient'; //red, infrared, heg

    head = ['timestamp'] as any[];

    lastLED;
    lastAmbient = 0;
    dataTemp = {};

    constructor(props) {
        super(props);

        
        ledGPIO.forEach((l) => {
            this.head.push(l+'_'+this.selectedChannel);
        })

    }

    componentDidMount() {
        this.canvas.className = 'chartMain'
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.backgroundColor = 'black';
        this.overlay.className = 'chartOverlay'
        this.overlay.width = 800;
        this.overlay.height = 600;
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.transform = 'translateY(-100%)';

    }

    connectDevice() {

    }

    disconnectDevice() {

    }

    listFiles() {

    }

    render() {
        return (<>
            <button onClick={(ev)=>{

            }}>Connect</button>
            <button onClick={(ev)=>{
                this.recording = !this.recording;
                this.created = false;
                ev.target.innerHTML = this.recording ? 'Stop Recording' : 'Record';
            }}>{this.recording ? 'Stop Recording' : 'Record'}</button>
            
            <table>
                <tbody>
                    <tr>
                        {/** Stats */}
                        <td>HEG</td> 
                        <td>HR</td>
                        <td>HRV</td>
                        <td>BREATH</td>
                    </tr>
                </tbody>
            </table>
            
            {/** Select chart view */}
            <select>

            </select>
            
            {/** Raw data */}
            <div ref={(ref)=>{
                ref.appendChild(this.canvas);
                ref.appendChild(this.overlay);
            }}></div>

            {/** Files */}
            <div>
            </div>
        </>)
    }
}