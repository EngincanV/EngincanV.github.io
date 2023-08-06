---
layout: post
title:  "Domain Events vs Integration Events"
date:   2023-08-06 00:00:00 +0300
categories: DDD Domain-Events Integration-Events Event-Driven-Architecture
image: "/assets/images/events/ordering-ms-domain-model.png"
---

In this article, I will describe what **domain events** and **integration events** are, how they differ, and how to decide when to use each one. 

## Domain Events

Domain Events represent something that happened in the past and the other parts of the same service boundary -same domain- need to react to these changes. 

It's a technique that is used to achieve consistency between **aggregates in the same domain**. 

For example, let's assume that we have an e-commerce application and in our **Order Microservice** we have a **Buyer** entity. Whenever an order is completed the related user becomes a buyer. Thus, we can say we need two aggregates for the **Order Microservice**: *Order Aggregate* and *Buyer Aggregate*.

![](/assets/images/events/ordering-ms-domain-model.png)

To achieve our domain rule (whenever an order is completed the related user becomes a buyer), we can publish a domain event. When the user initiates an order, the Order Aggregate publishes an **OrderStartedDomainEvent**. Then, this event can be handled by the **Buyer Aggregate** to create a new buyer in our ordering microservice, the **OrderStartedDomainEvent** can only provide the id of the user, and we can get the user's information from a different microservice (identity microservice).

With such use, we can build a **loosely coupled** system and achieve consistency between **aggregates in the same domain**. Because domain events help us to avoid direct dependencies between services. For example, if we would not use such an approach, we would need to inject the `IBuyerRepository` in the **OrderAppService** and create a buyer after the order completion (by using a method in the `IBuyerRepository` interface) and this would tightly couple our order service with the buyer repository.

In summary, Domain events can help you build a **loosely coupled** system. Domain events can be used to implement domain behaviors and rules based on the state changes of the entities, such as validating an order, applying discounts, or sending notifications etc.

A thumbs of rule from [Microsoft's Domain events: Design and implementation documentation](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation#domain-events-as-a-preferred-way-to-trigger-side-effects-across-multiple-aggregates-within-the-same-domain):

> "If executing a command related to one aggregate instance requires additional domain rules to be run on one or more additional aggregates, you should design and implement those side effects to be triggered by domain events."

## Integration Events

Integration events are used for bringing domain state in **sync across multiple microservices, or external systems**.

The purpose of the integration events is to propagate committed transactions and updates to **additional sub-systems**, with different services (it can be **microservices**, **bounded context**, or **external applications**).

Let's assume again, we have an e-commerce application and have some services, such as **Order MS**, **Catalog MS**, **Basket MS**, and so on... 

What we should do when a product price is updated? How we can reflect this change to a basket with the product which its price updated?

![](/assets/images/events/basket-ms-domain-model.png)

If a product price is updated in the *Catalog Microservice*, we should check the existing basket items in the *Basket Microservice* and update the same product price - reflect the same change in the basket service - and this can be achieved by publishing an integration event in the *Catalog Microservice* and handling the event in the *Basket Microservice* asynchronously.

By doing that, we can sync the domain state across multiple microservices. 

We can also have some local copies in different microservices, since we use microservices architecture and the sync communication should be avoided as much as possible. To synchronize data between the original source and the local copies, we can publish integration events and subscribes them to the related microservices, and updates the related data.

Also, integration events can be used to send email confirmation upon order completion.

There is so much use for integration events. The main purpose is something happened in the past and it has effects in our system's different parts and we need to take action for it in our services.

> Integration events are usually triggered by a domain event.

## Domain Events vs Integration Events

At the core, they are the same thing: **"A representation of something that happened in the past"**. 

> To differentiate the event types, it's a good practice to name them accordingly such as **OrderCompletedDomainEvent** or **PaymentCompletedIntegrationEvent**.

However, their purposes, use-cases, and implementation details are different:

* Domain Events happen **in-process** and **synchronously**, on the other hand, the Integration Events should be **asynchronously**.
* Domain Events published and consumed within a single domain. So you publish and subscribe to the event in the same application instance. On the other hand, integration events are consumed by other subsystems.
* Domain events are sent using an in-memory message bus, and integration events are sent with a message broker over a queue.

Domain events can be helpful if you need to achieve a domain rule between aggregates in the same domain in loosely coupled ways. Integration events can be helpful if you need to achieve domain rules the application-wide, globally, if it affects other sub-parts of your system.

---

Thanks for reading the post. You can give a thumbs-up if you found the article helpful. See you in the next one...