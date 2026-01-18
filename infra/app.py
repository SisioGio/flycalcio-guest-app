import aws_cdk as cdk
from stack import InfraStack

app = cdk.App()
InfraStack(app, "flycalcio-stack-infra")
app.synth()