#!/usr/bin/env python3
import aws_cdk as cdk
from stack import MyApiStack
import os
app = cdk.App()


MyApiStack(app, "FlyCalcioBackendStack")


app.synth()


