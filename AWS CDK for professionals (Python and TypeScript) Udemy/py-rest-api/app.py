#!/usr/bin/env python3
import os

import aws_cdk as cdk

from py_rest_api.py_rest_api_stack import PyRestApiStack


app = cdk.App()
PyRestApiStack(app, "PyRestApiStack",

    )

app.synth()
