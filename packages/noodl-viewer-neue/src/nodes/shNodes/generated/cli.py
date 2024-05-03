#!/usr/bin/python3

import sys
import json
import getopt
import numpy as np
import serial
import binascii


class node(object):
    def __init__(self, dict_):
        self.__dict__.update(dict_)

def dict2node(d):
    return json.loads(json.dumps(d), object_hook=node)


def loadAndParseJSON(name):
    jsFile = open(name)

    nodeData = json.load(jsFile)

    jsFile.close()

    return dict2node( nodeData["sensor"] )


def show_help():
  # generate help message
  for j in nodeObj.groups:
    print("")

    for i in j.configParams:
      if eval(i.guiEnabled)==True:
        print("Parameter: {0} (--{1}=<value>) Selected Value: {2}".format( i.name, i.internalName, globals()[i.internalName+"User"]))
        print("-"*60)
        print("  Values:")

        if ( isinstance(i.values[0][2], node)):
          valsUsr = jsonToRange(i.values[0][0])
          valsCmd = jsonToRange(i.values[0][1])
          valsInt = jsonToRange(i.values[0][2])

          col = 0
          print("   ",end="")
          for val in zip(valsUsr,valsCmd):
            col = col + 1
            print( "{:>16} ({})".format(val[0],val[1]), end="" )
            if col % 8 == 0: print() ; print("   ",end="")
          print()

        else:
          for k in i.values:
             print( "     {0:16} ( {1:30} = 0x{2:02X} ) ".format( k[0], k[1], eval(k[1]) ) )
        print("")


def jsonToRange( desc ):
     emin = eval(desc.min ) if isinstance( desc.min , str ) == True else desc.min
     emax = eval(desc.max ) if isinstance( desc.max , str ) == True else desc.max
     estp = eval(desc.step) if isinstance( desc.step, str ) == True else desc.step

     result = [] ;

     if emin == emax:
       result.append( desc.format.format(emin) )
       return result

     for k in  np.arange(emin,emax,estp).tolist():
       result.append( desc.format.format(k) )

     return result

def evalToInt( exp ):

   while isinstance(exp, int) == False:
     exp = eval(exp)

   return exp


def executeCommand( port, command, response, debug ):
      if debug == True:
            s = binascii.hexlify(command).decode('ascii')
            print("Command : "+" ".join(s[i:i+2] for i in range(0, len(s), 2)))

      port.write(command)

      if response == True:
           rsp = port.read(4)

           if len(rsp) < 4: return None

           if rsp[3] > 0:
               rsp = rsp +  port.read( rsp[3] )

           if debug == True:
                s = binascii.hexlify(rsp).decode('ascii')
                print("Response: "+" ".join(s[i:i+2] for i in range(0, len(s), 2)))

      return rsp


nodeObj = loadAndParseJSON( sys.argv[1] )


# define registers
for j in nodeObj.registers:
    exec( j.name + "=" + j.value )


# define values
for j in nodeObj.values:
    exec( j.name + "=" + j.value  )


# build opts array
opts=[]

vals=[]
cmds=[]




for j in nodeObj.groups:
    for i in j.configParams:
       opts.append("{0}=".format( i.internalName))

       if ( isinstance(i.values[0][2], node)):
         valUsr = jsonToRange(i.values[0][0])[0]
         valCmd = jsonToRange(i.values[0][1])[0]
         valInt = jsonToRange(i.values[0][2])[0]

         exec( "{}User= \"{}\"".format(i.internalName, valUsr) )
         exec( "{}Cmd = \"{}\"".format(i.internalName, valCmd) )
         exec( "{}    =   {}  ".format(i.internalName, valInt) )
         exec( "{}Ena =   \"{}\"  ".format(i.internalName, i.guiEnabled) )

       else:
         exec("{0}User=\"{1}\"".format(i.internalName, i.values[0][0]))
         exec("{0}Cmd =\"{1}\"".format(i.internalName, i.values[0][1]))
         exec("{0}    =  {1}  ".format(i.internalName, i.values[0][2]))
         exec( "{}Ena =  \"{}\"  ".format(i.internalName, i.guiEnabled) )

# parse command line options
opts.append("help")
opts.append("debug")
opts.append("usb")
opts.append("addr=")

try:
    names, args = getopt.getopt(sys.argv[2:], "", opts )

except getopt.GetoptError as err:
    print(str(err))

queueHelp = 0
debug = 0
usb = 0
addr ="00"

for o, a in names:
    if o == "--help": queueHelp = 1
    elif o == "--debug": debug = 1
    elif o == "--usb": usb = 1
    elif o == "--addr": addr = a
    elif o in [ "--"+x.replace("=","") for x in opts ]:
        opt = o.replace("--","")
        exec(opt+"User=\""+a+"\"")

opts.remove("help")
opts.remove("debug")
opts.remove("usb")
opts.remove("addr=")

# evaluate options to create runtime params
for j in nodeObj.groups:
    for i in j.configParams:
        found = 0

        # we need to check if option is enabled
        if eval(eval(i.internalName+"Ena")) == False:
           continue

        if ( isinstance(i.values[0][2], node)):
          temp = eval(i.internalName+"User")

          # We're running exec on user defined strings on server? Yes, we are. YEEHAW!
          if temp in jsonToRange(i.values[0][0]):
            exec( i.internalName+"    = jsonToRange(i.values[0][2])[ jsonToRange(i.values[0][0]).index(temp) ]")
            exec( i.internalName+"Cmd = jsonToRange(i.values[0][1])[ jsonToRange(i.values[0][0]).index(temp) ]")

          else:
            print("ERROR {} {}".format(i.internalName, temp ))

        else:
          for k in i.values:
            exec( "if "+i.internalName+"User == k[0]: "+i.internalName+"    = eval(\"{}\") ; found = 1".format(k[2]) )
            exec( "if "+i.internalName+"User == k[0]: "+i.internalName+"Cmd =     (\"{}\") ; found = 1".format(k[1]) )

          if found == 0: print("ERROR: {} {}".format(i.internalName, eval(i.internalName+"User") )  )


# display what was ignored
for o,a in names:
    opt = o.replace("--","")

    #skip fixed options
    if opt == "help":  continue
    if opt == "debug": continue
    if opt == "usb":   continue
    if opt == "addr":   continue

    if eval(eval(opt+"Ena")) == False:
        print("Option --{} is not allowed with current setting. Value will be ignored.".format(opt))


if queueHelp == 1: show_help()


# at this point each param is declared as variable and has default or user string assigned
# each param is also declared with Runtime suffix which has runtime value assigned

if debug == 1:
#summary of selected stuff

  for i in [ x.replace("=","User") for x in opts ]:
      print("{} = {}".format(i,eval(i)))
  print("")

  for i in [ x.replace("=","Cmd") for x in opts ]:
      print("{} = {}".format(i,eval(i)))
  print("")

  for i in [ x.replace("=","") for x in opts ]:
      print("{} = {}".format(i,eval(i)))
  print("")


commands = [] ;


for j in nodeObj.commands:
     if eval("(" + j.condition + ")") == True:
         print(j.comment)
         commands.append(j.command)

# exchange vars (actual value -> value to be placed in command - evaluate it down to int
for i in [ x.replace("=","") for x in opts ]:
    exec("{}    = evalToInt({}Cmd)".format(i,i))

if usb == 1:
    port = serial.Serial("/dev/ttyACM0",115200, timeout=20)

for i in commands:
    cmd = [] ;

    # evaluate all fields of command
    for j in i:
      cmd.append( eval(j) )

    print(  ("%s" % ' '.join(['0x{:02X}']*len(i))).format(*cmd)  )

    if usb == 1:
       print(addr)
       command = bytearray.fromhex( (' '.join(['{:02X}']*len(i))).format(*cmd) )  ;
       command[0] = bytearray.fromhex( addr )[0]
       executeCommand(port, command, True, True)

