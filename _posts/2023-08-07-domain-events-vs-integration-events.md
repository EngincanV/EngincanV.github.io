---
layout: post
title:  "Domain Events vs Integration Events"
date:   2023-08-07 00:00:00 +0300
categories: DDD Domain-Events Integration-Events Event-Driven-Architecture
---

In this article, I will describe what **domain events** and **integration events** are, how do they differ, and how to decide when to use each one.

## Domain Events

Domain Events represent something that happened in the past and the other parts of the same service boundary -same domain- need to react to these changes. 

In other words, it's a tactical pattern that used to achieve consistency between **aggreagates in the same domain**. 

For example, let assume that we have an e-commerce application and in our **Order Microservice** we have an **Buyer** entity. Whenever a order is completed the related user becomes a buyer. Thus, we can say we need two aggregate for the **Order Microservice**: *Order Aggregate* and *Buyer Aggregate*.

![](/assets/images/events/ordering-ms-domain-model.png)

To achieve our domain rule (whenever a order is completed the related user becomes a buyer), we can publish an domain event. When the user initiates an order, the Order Aggregate publishes an **OrderStartedDomainEvent**. Then, this event can be handled by the **Buyer Aggregate** to create a new buyer in our ordering microservice, the **OrderStartedDomainEvent** can only provide the id of the user, and we can get the user's information from a different microservice (identity microservice).

Such a use, we can build a **loosely coupled** system and achieve consistency between **agregates in the same domain**. Because, domain events help us to avoid direct dependencies between services. For example, if we would not use such an approach, we would need to inject the `IBuyerRepository` in the **OrderAppService** and create a buyer after the order completion and this would tighly couple our order service with the buyer repository.

In summary, Domain events can help you build a **loosely coupled** system. Domain events can be used to implement domain behaviors and rules based on the state changes of the entities, such as validating an order, applying discounts, or sending notifications.

### Implementing Domain Events

Let's see how we can publish and handle domain events in a system. We can use the [*Mediatr*](https://github.com/jbogard/MediatR) library for in-process messaging for this example.

> You can find the source code of the application at <TODO: link!!!>. Don't hesitate to check the source code, if you are stuck or miss any point.

//TODO: show the implementation steps!!!

## Integration Events

Integration events are used for bringing domain state in **sync across multiple microservices, or external systems**.

The purpose of the integration events is to propagate committed transactions and updates to **additional subsystemss**, with different services (it can be **microservices**, **bounded context** or **external applications**).

Let's assume again, we have an e-commerce application and have some services, such as **Order MS**, **Catalog MS**, **Basket MS** and so on... 

What we should do when a product price is updated? How we can reflect this change to a basket with the product which its price updated?

If a product price is updated in the *Catalog Microservice*, we should check the existing basket items in the *Basket Microservice* and update the same product price - reflect the same change in the basket service - and this can be achieved by publishing an integration event in the *Catalog Microservice* and handling the event in the *Basket Microservice* asynchronously.

By doing that, we can sync domain state across multiple microservices. 

For a second example, we can also have some local copies in different microservices, since we use microservices architecture and the sync communication should be avoided as much as possible. To synchorize data between the origial source and the local copies, we can publish integration events and subscribes them in the related microservices and updates the related datas.

Also, integration events can be used to sending an email confirmation upon order completion.

There are so much use of integration events. The main purpose is something happened in the past and it has effects in our system's different parts and we need to take actions for it in our services.

> So far, we have seen what domain events and integration events are, and a simple implementation for domain events. I will not show how to implement integration events, because they are not occur in-process, and instead it involves a event bus. Such as RabbitMQ, Azure Service Bus etc. Therefore, I aim to create a new article that shows how to publish/subscribe integration events.

## Domain Events vs Integration Events

In core, they are the same thing: **"A representation of something that happened in the past"**

However, their purposes, use-cases and implementation details are different:

* Domain events happens in-process, on the other hand, the Integration Events should be asynchronously.
* Domain Events published and consumed within a single domain. So you publish and subscribe the event in the same application instance. On the other hand, integrations events consumed by other subsystems.
* Domain events sent using an in-memory message bus, integrations events sent with a message broker over a queue.

TL;DR; Domain events are helpful, if you need to achieve a domain rule between agregates in the same domain with loosely coupled ways. Integration events are helpful, if you need to achieve domain rules in the application wide, globally, if it effects other sub-parts of your system.

---

Thanks for reading the post. In the next post, I will be showing how to implement integration events. Please, gives a thumbs-up if you found the article helpful. See you in the next one...