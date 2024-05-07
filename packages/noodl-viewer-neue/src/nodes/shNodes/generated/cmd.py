#!/usr/bin/python3

import serial
import getopt
import sys
import binascii
import time 

def usage(code):
    print("\nLow level utility to control iEnable\n")
    print("    -h,--help             prints this message")
    print("    -p,--port=            selects UART port for communication")
    print("    --target=             set target driver")

    print("\n")

    sys.exit(code)

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


def main():
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hp:a:", [
              "help",
              "port=",
              "addr="
              ])

    except getopt.GetoptError as err:
        print(str(err))  # will print something like "option -a not recognized"
        usage(2)

    portName = "/dev/ttyACM0"
    addr = 0
    sequence = []

    for o, a in opts:
        if o in ("-h", "--help"):
            usage(0)
        elif o in ("-p", "--port"):
            portName = a
        elif o in ("--addr"):
            addr = a
        else:
            assert False, "unhandled option"

    port = serial.Serial(portName,115200, timeout=20)

    command = bytearray.fromhex( ' '.join(args) )  ;

    command[0] = bytearray.fromhex( addr )[0]
    command[3] = len(command)-4

#check if only one command was specified
    response = executeCommand(port, command, True, True)

    port.close()

if __name__ == "__main__":
    main()

