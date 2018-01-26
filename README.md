# polly-s3-lambda
Lambda function for saving the Polly text to speech result of a query into an S3 bucket

# Usage

Use as a handler in AWS Lambda. 
- The environment variable POLLY_S3_BUCKET must contain the name of a valid S3 bucket to store the audio files in.
- Set up an Object Expiration Policy inside S3: https://aws.amazon.com/blogs/aws/amazon-s3-object-expiration/
- Mark your bucket as serving a static website. Files uploaded will be marked public.
