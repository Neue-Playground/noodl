import sys
import json
import PySimpleGUI as sg
import numpy as np 


class node(object):
    def __init__(self, dict_):
        self.__dict__.update(dict_)


def dict2node(d):
    return json.loads(json.dumps(d), object_hook=node)



def calculatePower( obj ):
    currentVars = {}
    
    for j in obj.groups:    
        for i in j.configParams:
           currentVars[i.internalName] = i.runtime["power"]

    for k in currentVars:
        exec( "{0} = {1}".format(k,currentVars[k]))

    pwr = eval( obj.powerConsumption) 
    _upd = window.find_element("label_power",silent_on_error = True)
    if not isinstance(_upd, sg.ErrorElement):
      _upd.update(value="%.2f" % pwr)


def appendRuntimeProps(currentVars, i):
        for k in currentVars:
            exec( "{0} = {1}".format(k,currentVars[k]))

        i.runtime["name"] = i.internalName
        i.runtime["guiEnabled"] = eval(i.guiEnabled)
        i.runtime["values"] = [] ;
        i.runtime["powers"] = [] ;
        i.runtime["names"]  = [] ;
        
        if i.guiControl == "checkbox":
            for j in i.values:
                i.runtime["values"].append( j[2] )
                i.runtime["powers" ].append( j[3] )
                i.runtime["names" ].append( j[0] )
                
        if i.guiControl == "slider": 
            if len(i.values) > 1:
                for j in i.values:
                    i.runtime["values"].append( j[2] )
                    i.runtime["powers" ].append( j[3] )
                    i.runtime["names" ].append( j[0] )
            else:
                if i.values[0][2].type == "range":
                    if type( i.values[0][2].min ) is str:
                        min  = eval(i.values[0][2].min)
                    else:
                        min = i.values[0][2].min

                    if type( i.values[0][2].max ) is str:
                        max  = eval(i.values[0][2].max)
                    else:
                        max = i.values[0][2].max

                    if type( i.values[0][2].step ) is str:
                        step = eval(i.values[0][2].step)
                    else:
                        step = i.values[0][2].step

                    i.runtime["values"] = np.arange(min,max,step).tolist() 
                    
                    i.runtime["names"] = [] 
                    
                    for j in i.runtime["values"]:
                       i.runtime["names"].append( i.values[0][0] % ( j ) )
       
                    i.runtime["powers"] = i.runtime["values"]

        i.runtime["selName"] = i.runtime["names" ][ int( i.runtime["selIndex"]) ]
        i.runtime["value"]   = i.runtime["values"][ int( i.runtime["selIndex"]) ]
        i.runtime["power"]   = i.runtime["powers"][ int( i.runtime["selIndex"]) ]


def initializeFields(obj):
    for j in obj.groups:    
        for i in j.configParams:
            i.runtime = {}
            i.runtime["selIndex"] = i.defaultValue[0]
            i.runtime["value"]    = i.defaultValue[1]
            i.runtime["power"]    = i.defaultValue[1]


def evaluateFields(obj):
    currentVars = {} 

    for j in obj.groups:
        for i in j.configParams:
           currentVars[i.internalName] = i.runtime["value"]

    for j in obj.groups:
        for i in j.configParams:
            appendRuntimeProps(currentVars, i )


def createGroup( name, layout, group ):
    if name != None:
        layout.append( [sg.Text(name, font="* 10 bold")] )

    for i in group:

        if  i.runtime["guiEnabled"] == True:
          _color = 'lightgreen'
        else:
          _color = 'orange red'

        if i.guiControl == "checkbox":
            _e = sg.Checkbox(i.name, disabled=not i.runtime["guiEnabled"], enable_events = True, key=i.internalName)
            _e.ref = i ;
            layout.append( [ sg.Text("ACT", size=(5,1), text_color=_color, key="act_{0}".format(i.internalName)), _e] )        

        if i.guiControl == "slider":
            _range=(0, 99)

            if len(i.values) > 1:
                _range=(0, len(i.values)-1 )
            else:
                if i.values[0][2].type == "range":
                    _range=(0, len(i.runtime["names" ])-1)

            _e = sg.Slider(range=_range, orientation='h', size=(20, 20), default_value=0, disable_number_display=False, disabled = not i.runtime["guiEnabled"], enable_events = True, key=i.internalName, relief = "sunken")
            _e.ref = i
            layout.append( [sg.Text("ACT", size=(5,1), text_color=_color, key="act_{0}".format(i.internalName)), sg.Text(i.name, size=(20,1)), _e, sg.Text("selected", size=(20,1), key="label_{0}".format(i.internalName))] )

def createPortInfo( name, layout, ports ):
    if name != None:
        layout.append( [sg.Text(name, font="* 10 bold")] )

    for i in ports:
        layout.append( [ sg.Text("%d " % i.index, size=(4,1)), sg.Text("%s" % i.name, size=(16,1)), sg.Text("%-4s" % i.type, size=(4,1)), sg.Text( "%-16s" % i.value) ] ) 

def createPowerInfo( name, layout ):
    if name != None:
        layout.append( [sg.Text(name, font="* 10 bold")] )

    layout.append( [ sg.Text("Estimated Power:", size=(28,1)), sg.Text("0", size=(10,1), key="label_power"), sg.Text("uA") ] ) 

 
#
# MAIN program
#
jsFile = open( sys.argv[1] )
nodeData = json.load(jsFile)
jsFile.close()


nodeObj = dict2node( nodeData["sensor"] ) 

layout = []

layout.append( [sg.Text(nodeObj.name + " " + nodeObj.examplePartNumber, font="* 10 bold")] )

initializeFields(nodeObj)
evaluateFields(nodeObj)


for i in nodeObj.groups:
   createGroup( i.groupName, layout, i.configParams )

createPortInfo ("Patch Ports:", layout, nodeObj.ports)
createPowerInfo("Power Consumption", layout )


l = [[ sg.Column(layout, scrollable=True,  vertical_scroll_only=True, size=(None,800)) ]]
 
window = sg.Window("Demo", l, finalize = True)
 
 
for i in window.element_list():
    if hasattr(i,"ref"):
        _r = i.ref.runtime                
        i.update( disabled = not _r["guiEnabled"] )               

        _upd = window.find_element("act_{0}".format(i.key),silent_on_error = True)
        if not isinstance(_upd, sg.ErrorElement):
           if  _r["guiEnabled"] == True:
             _color = 'lightgreen'
           else:
              _color = 'orange red'
           _upd.update(text_color=_color)

        _upd = window.find_element("label_{0}".format(i.key),silent_on_error = True)
        if not isinstance(_upd, sg.ErrorElement):
           _upd.update(value=_r["selName"], text_color=_color)


# Create an event loop
while True:
    event, values = window.read()

    if event != None:
        element = window[event] ;

        _r = element.ref.runtime
        _r["selIndex"] = values[event]
        _r["selName"]  = _r["names"][int(values[event])]
        _r["value"]    = _r["values"][int(values[event])]
        _r["power"]    = _r["powers"][int(values[event])]

        # recalculate props of controls
        evaluateFields(nodeObj)
        calculatePower(nodeObj)

        # disable element which are no longer available
        for i in window.element_list():
            if hasattr(i,"ref"):
                _r = i.ref.runtime
                i.update( disabled = not _r["guiEnabled"] )

                _upd = window.find_element("act_{0}".format(i.key),silent_on_error = True)
                if not isinstance(_upd, sg.ErrorElement):
                   if  _r["guiEnabled"] == True:
                     _color = 'lightgreen'
                   else:
                     _color = 'orange red'
                   _upd.update(text_color=_color)

                _upd = window.find_element("label_{0}".format(i.key),silent_on_error = True)
                if not isinstance(_upd, sg.ErrorElement):
                  _upd.update(value=_r["selName"], text_color=_color)


    if event == "OK" or event == sg.WIN_CLOSED:
        break

window.close()


