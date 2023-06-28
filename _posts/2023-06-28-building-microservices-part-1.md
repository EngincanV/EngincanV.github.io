---
layout: post
title:  "Building Microservices - Part 1"
date:   2023-06-28 00:00:00 +0000
categories: Book-Review Microservices
image: "/assets/images/book-review/building-microservices.jpg"
---

In this article, I talk about my takeaways from the [Building Microservices book by Sam Newman](https://www.amazon.com/Building-Microservices-Sam-Newman/dp/1491950358). I aim to share my notes about this book in multiple posts and this is the first post of this series.

The book begins with an introduction to microservices, including their key benefits, then discusses the difficulties and evolution of this architecture. After giving a complete overview, it describes how to model services, suggestions for technology stack choices and how to align them in systems, splitting a monolith application to microservices, deployment, testing, monitoring of services, security, how an organizational structure should be (Conway's law), how to scale a large number of services and finally brings it all together.

In this post, I will be talking about the following topics and try to give you an overview:

* What are microservices? (Key benefits, Microservices vs SOA, Decomposition Techniques)
* Building Standards (Monitoring, Interfaces and Architectural Safety)
* Building a Team

## What are microservices?

We can define Microservices as small, autonomous services that work together. Key aspects of Microservices:

* They should be **small** and **focused on doing one thing well** (SRP - Single Responsibility Principle)
* **Autonomous** (Microservices should be changed independently of each other and be deployed by themselves without requiring consumers to change)
* Allows to use different technology stacks, programming languages, tools,  etc. (This allows us to pick the right tool for each job, rather than having to select a more standardized, one-size-fits-all approach)
* They should be designed **Resilient**. (If one component of a system fails, the other parts of the system should continue to work)
* Easily **Scalable** . (it's easy to scale a service rather than an all application like in monolith applications)
* **Ease of deployment** (by its nature of autonomous, a service typically would not depend on another service - at least directly - and this allows to deploy services frequently, whenever a new feature comes out. This is one of the main reasons why organizations like Netflix and Amazon use this architecture)
* Easy rollback. (Since we are just deploying certain services, we can easily rollback them if any error occurs)
* ...

We can make this list much longer but the characteristics of a microservices architecture can be stated as *independent*, *small*, *autonomous*, *scalable* and *ease of deployable* bunch of services that works together well. 

### SOA vs Microservices

Service-oriented architecture (SOA) is a design approach where multiple services collaborate to provide some end set of capabilities. Communication between these services occurs via calls across a network.

SOA emerged as an approach to combat the challenges of large monolithic applications. It is an approach that aims to promote the reusability of software.

So far, it was like I was describing Microservices, right? But there are huge nuances between these two architectural approaches.

SOA emerged in the late 1990s, so it's an old architectural idea. Despite many efforts, there is a lack of good consensus on how to do SOA well. SOA doesn't help you understand how to split something big into something small. It doesn't talk enough about real-world, practical ways to ensure that services do not become overly coupled. The number of things that go unsaid is where many of the pitfalls associated with SOA originate.

On the other hand, the Microservice approach has emerged from real-world use, and with the support of big organizations such as Netflix, it built up with standard approaches and guidelines

Actually, the microservice approach can be thought of as a specific approach for SOA in the same way that Scrum is a specific approach for Agile software development.

### Decomposition Techniques

When you get down to it, many of the advantages of a microservice come from its granular nature and being independent of other projects, being autonomous. But in reality, we need to share some functionality through our services, because they are common requirements. At that point we need to make a decision should we use shared libraries or not?

#### Shared Libraries

Libraries give you a way to share functionality between teams and services. I might create a set of useful collection utilities, for example, or perhaps a statistics library that can be reused. Teams can organize themselves around these libraries, and the libraries themselves can be reused. But there are some drawbacks:

* First, you lose true technology heterogeneity. The library typically has to be in the same language, or at the very least run on the same platform. 
* Second, the ease with which you can scale parts of your system independently from each other is curtailed. 
* Next, unless you’re using dynamically linked libraries, you cannot deploy a new library without redeploying the entire process, so your ability to deploy changes in isolation is reduced.

You’ll find yourself creating code for common tasks that aren’t specific to your business domain that you want to reuse across the organization, which is an obvious candidate for becoming a reusable library. You do need to be careful, though. Shared code used to communicate between services can become a point of coupling.

Services can and should make heavy use of third-party libraries to reuse common code.

### No Silver Bullet

Microservices are not a silver bullet, and make for a bad choice as a golden hammer. They have all the associated complexities of distributed systems, and while we have learned a lot about how to manage distributed systems well it is still hard.

If you’re coming from a monolithic system point of view, you’ll have to get much better at handling deployment, testing, and monitoring to unlock the benefits we’ve covered so far. You’ll also need to think differently about how you scale your systems and ensure that they are resilient. Don’t also be surprised if things like distributed transactions or CAP theorem start giving you headaches, either!

## Building Standards

We need to decide on some standards to easily manage the microservices. We should not be losing sight of the bigger picture by just focusing on a certain microservice.

### Monitoring

We need to monitor our system **in one place**. There are a couple of approaches to composing all metrics and logs in a central place. For example, you might choose to adopt a push mechanism, where each service needs to push it into a central location. Or alternatively, you might decide to use polling systems that scape data from the nodes themselves.

> The important point here: **we need it in one place**. 

### Interfaces

Picking a small number of defined interface technologies helps integrate new consumers. This means we should decide on a standard interface and stick to it as long as it's possible.

This is not just specific to picking a technology, and the protocol. If you pick HTTP/REST, for example, will you use verbs or nouns? Which status codes that you use in certain cases? etc.

### Architectural Safety

We cannot afford for one badly behaved service to ruin the party for everyone. We have to ensure that our services shield themselves accordingly from unhealthy, downstream calls. The more services we have that do not properly handle the potential failure of downstream calls, the more fragile our systems will be.

Therefore, we must design our system as resilient and tolerate faults as much as possible. Also, retry mechanisms and short-circuit approaches come into play at that point.

### Building a team

It’s the people you work with who will be doing the work. A great software comes from great people. If you worry only about the technology side of the equation, you’re missing way more than half of the picture. 

Building a great team is a must, if you want to build a great product!

---

## Conclusion

In this article, I shared my takeaways from the Building Microservices book. This is the first post of the series and I aim to write the follow-up posts as soon as possible. 

In the following articles, we will be looking at more exciting topics, such as splitting monolith apps into microservice, deployments, contract testing, etc... 

This article was just a warm-up and I tried to give you an overview of the book.

Thanks for reading this article, I hope you found it helpful. See you in the next one!
