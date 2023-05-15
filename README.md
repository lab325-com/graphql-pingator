# GraphQL Pingator Bot

This bot is created for such purposes as health checking and monitoring your endpoints in development and production as well. 

It's called ```GraphQL Pingator``` but it supports both REST and GraphQL types of endpoints.

### Why should you use it

Imagine you have complex structure in your web application, and it's hard to know whether your backend is working perfectly fine or not. So that's why this bot exists. You can define a graphql resolver in you backend that checks everything in your application (e.g. Database, Redis, RabbitMQ, S3), and if something doesn't respond you must return/throw an error which describes the problem. Our bot will hit your API in predefined interval and if it returns an error bot will alert you and your team will know about some problems in your app. 

Yep, we also cover cases where your api doesn't respond.

### Features
- It can hit both REST and GraphQL backends
- You can provide expiration to each endpoint, so it won't hit your api forever
- It supports expected status code for your REST endpoint. So if everything is okay - return for example 200 OK, if your RabbitMQ is not working - return any other status code and our bot will alert you about it

*At the end of the day* you have nice and user-friendly bot and you are not aware of not knowing of some problems in your web application

### Wanna ask some questions?
- email me on makstyulyukov@gmail.com
