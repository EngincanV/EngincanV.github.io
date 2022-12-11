---
layout: post
title:  "My Notes from Google Technical Writing Course"
date:   2022-12-11 00:00:00 +0300
categories: technical-writing
---

Technical writing is an important skill and I think every engineer needs to spend some time improving their writing skills. There are great free courses all over the internet and [Google's Technical Writing One](https://developers.google.com/tech-writing/one) course is one of them.

As a software engineer, I really like writing articles. It helps me to check if I understood the related topic or if any blurry things left, so I can more focus on it. Also, it's a really good motivation source to learn new things and try them. 

By writing/reading articles frequently, I'll get better eventually but I wanted to speed up this process and learn the core topics of technical writing.

Therefore, I started [Google's Technical Writing One](https://developers.google.com/tech-writing/one) course and completed it on the same day. It is a really good course and gives me good tips to get better at writing and I wanted to share some of my notes. Let's get started.

## Define new or unfamiliar terms

When writing or editing, learn to recognize terms that might be unfamiliar to some or all of your target audience. If you spot an unfamiliar term, you can do the following things:

* If the term already exists, **link to a good existing explanation.** (Don't reinvent the wheel.)
* **If your document is introducing the term, define the term**. 

## Use terms consistently

When writing an article, we should use terms consistently, which means we should not use different variations of the same word randomly in our articles.

| Bad ❌ | Good ✅ |
|---|---|
| Protocol Buffers provide their own definition language. ... And that's why protobufs have won so many county fairs.  | Protocol Buffers (or protobufs for short) provide their own definition language. Blah, blah, blah. And that's why protobufs have won so many county fairs. |

<br />

> Notice, the good sentence first uses the full term and then puts the acronym in parentheses. This is also good practice.

## Don't use "this" and "that" if it's not clear what they refer to

To help readers, avoid using this or that in ways where it's not clear what they refer to. Use either of the following tactics to clarify ambiguous uses of **this** and **that**:

* Replace **this** or **that** with the appropriate noun.
* Place a noun immediately after **this** or **that**.

## Active voice vs passive voice

> **Tip**: The vast majority of sentences in technical writing should be in **active voice**.

Use active voices over passive voices, whenever possible. Consider the following sentences, which one is clearer?

> The player kicks the soccer ball. -> `active voice` (Good ✅)
> The soccer ball is kicked by the player. -> `passive voice` (Bad ❌)

While revising an article and finalizing it, find the passive voices and try to convert them to active voices.

**For example:** Assume you have a sentence like "Code is interpreted by Python, but code is compiled by C++.", you can convert it to an active voice like "Python interprets code, but C++ compiles code."

Active voice provides the following advantages:

* Readers mostly convert passive voice to active voice in their own mind. Therefore, instead of giving your readers extra processing time, stick to active voice, so readers read straightly.
* Active voice is generally shorter than passive voice. You can see the above examples for instance.

## Choose strong verbs

Pick the right verb and the rest of the sentence will take care of itself.

Reduce imprecise, weak, or generic verbs, such as the following:

* forms of *be*: is, are, am, was, were, etc.
* occur
* happen

*Example*:

> "The exception **occurs** when dividing by zero."

We can change this sentence and use a stronger verb like *raises* instead of *occurs*

> "Dividing by zero **raises** the exception."

<br />

## Reduce "there is" / "there are"

Reducing the there is/are statements makes a sentence clear:

| Bad ❌ |  Good ✅ |
| --- | --- |
| There is a variable called `abc` that stores the current accuracy. | A variable named `abc` stores the current accuracy. |
| There are two disturbing facts about Perl you should know. | You should know two disturbing facts about Perl. |

<br />

## Use short sentences if possible

Shorter sentences communicate more powerfully than long sentences, and are usually easier to understand.

## Each sentence should only focus on a single idea/topic

Focus each sentence on a single idea, thought, or concept. Just as statements in a program execute a single task, sentences should execute a single idea.

So, after you have completed an article and started revising it check the sentences and if you find more than one topic in a sentence, separate it into a new sentence.

## Distinguish "that" from "which"

Use the "that" word for the essential subordinate clause and use the "which" word for the non-essential subordinate.
Consider the following sentences:

1. Python is an interpreted language, **which** Guido van Rossum invented.
2. Fortran is perfect for mathematical calculations **that** don't involve linear algebra.

In the first sentence, the "which" is used to give a piece of extra information about the context. But in the second sentence, the "that" is used to bind the two related things and these are highly coupled to each other.

> **Tip:** Place a comma before **which**; do not place a comma before **that**. 

<br />

## Choose the correct type of list

There are three types of lists:

* bulleted list
* numbered list
* embedded list

Use a **bulleted list** for unordered items; use a **numbered list** for ordered items and use an **embedded list** for items within a sentence.  

> Generally speaking, **embedded lists** are a poor way to present technical information. **Try to transform embedded lists into either bulleted lists or numbered lists.**

<br />


## Start numbered list items with imperative verbs

Consider starting all items in a numbered list with an imperative verb. An imperative verb is a **command**, such as `open` or `start`.

*Example*:

>  1. **Download** the A app from Google Play.
>  2. **Configure** the A app's settings.
>  3. **Start** the app.

## Introduce each list and table

Introducing each list and table with a sentence that tells readers what the list or table represents is a good practice. Place a colon rather than a period after the introductory sentence.

Using the `following` word is recommended to put into the introductory sentence.

For example: "Take the **following** steps to install our application:".

<br />

## Do not make paragraphs too long or too short

Long paragraphs are visually intimidating. When revising, consider dividing a very long paragraph into two separate paragraphs.

Conversely, don't make paragraphs too short. If your document contains plenty of one-sentence paragraphs, your organization is probably faulty.

> **Tip:** Readers generally welcome paragraphs containing **three to five sentences**, but will avoid paragraphs containing more than about **seven sentences**.

<br />

## Answer "what", "why" and "how" questions

To write a good article, you should answer the following three questions:

1. What are you trying to tell your reader?
2. Why is it important for the reader to know this?
3. How should the reader use this knowledge?

## Focus on your audiences

Make sure your document provides the information that your audience needs but doesn't already have. Take the following actions:

* Define your audience.
* Determine what your audience needs to learn.
* Fit documentation to your audience.

## Prefer simple words and avoid idioms

Most of the audiences are more comfortable in languages other than English (most of your readers, probably will be not native English speakers). Therefore, prefer simple words over complex words; avoid obsolete or overly-complex English words.

Avoid **idioms** because idioms are phrases whose overall meaning differs from the literal meaning of the individual words in that phrase. For example, instead of using a word like "a piece of cake", prefer a more common word like "this task is done".

---

## Conclusion

In this article, I wanted to share the notes that I've taken from [Google's Technical Writing One Course](https://developers.google.com/tech-writing/one). 

It's a really good course and gives me great tips for technical writing. I highly recommend it if you are considering being a technical writer or want to improve your writing skills.

Thanks for reading the article. I hope you find it useful. See you in the next article...