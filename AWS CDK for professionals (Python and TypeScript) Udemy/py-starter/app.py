#!/usr/bin/env python3
import os

import aws_cdk as cdk

from py_starter.py_starter_stack import PyStarterStack
from py_starter.py_shared_stack import PySharedStack
from py_starter.py_handler_stack import PyHandlerStack

app = cdk.App()
starter_stack = PyStarterStack(app, "PyStarterStack")
shared_stack = PySharedStack(app, "PySharedStack")
PyHandlerStack(app, "PyHandlerStack", bucket=shared_stack.my_shared_bucket) # to jest wywołanie konstruktora do utworzenia nowego stosu. i jako parametr mamy bucket wcześniej utworzony - shared_bucket

app.synth()
