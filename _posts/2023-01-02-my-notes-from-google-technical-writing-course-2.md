---
layout: post
title:  "My Notes from Google Technical Writing Course - 2"
date:   2023-01-02 00:00:00 +0000
categories: technical-writing
---

Technical writing is an important skill and it's part of our daily tasks. You write code and technical documentation to present your development to the consumers of your application/product. It's a great learning step and also helps to improve documented API. For example, while writing an article you can see the missing APIs or new features/enhancements and take action for that.

I try to improve myself in writing technical articles for such reasons and more. Also, I think it makes me a better developer. Therefore, I've searched for ways that improve my writing skills and found [technical writing courses of Google's](https://developers.google.com/tech-writing/overview). On December 11 of 2022, I started the first one of the courses and shared takeaways in an article, which you can check [here](https://engincanv.github.io/technical-writing/2022/12/10/my-notes-from-google-technical-writing-course.html).

After I finished the first course, I checked for the second one, which summarizes the first course and gives advanced tips for organizing documentation. I give it a try and completed it on the same day. I took some notes and wanted to share them in a new article within sub-sections. 

## Self-editing

In most cases, working towards a final published document is an iterative process. Transforming a blank page into a first draft is often the hardest step. After creating the first draft, revise the documentation and try to make it better. 

You can use the following list as a checklist:

- Use **active voice** over **passive voice**.
- Format sequential steps as **numbered lists**.
- Format most other lists as **bulleted lists**.
- Refer to your audience as **"you"** rather than "**we**". This is real-important, stick with the referring and be consistent about it.
- Format [code-related text as code font](https://developers.google.com/style/code-in-text).
- [Place conditional clauses before an instruction](https://developers.google.com/style/clause-order), rather than after.
- Break long sentences into **shorter sentences** or **lists**.
- Step back and try to read your draft from your audiences’ point of view.
- Read it out loud. Check for awkward phrasings, too-long sentences, and anything else that doesn't fit in your documentation.
- After you write your first draft, set it aside. Come back to it after an hour (or two or three) and try to read it with fresh eyes.

## Organizing large documents

Before starting to write an article straight, it might be a good idea to **outline** the document first. 

### Outline a document

Starting with a structured, high-level outline can help you group topics and determine where more detail is needed. The outline helps you move topics around before you get down to writing.

You can use the following tips for outlining documentation:

- Before you ask your reader to perform a task, explain to them why they are doing it.
- Structure your outline so that your document introduces information when it's most relevant to your reader.
- Consider explaining a concept and then demonstrating how the reader can apply it either in a sample project or in their own work and if possible provide alternatives.

You can see an example outline of a document in below illustration:

![](/assets/images/tech-writing/outline.png)

> I took the outline from an old Github issue. You can check it [here](https://github.com/abpframework/abp/issues/12489).

### Introduce a document

If readers of your documentation can't find relevance in the subject, they are likely to ignore it. To set the ground rules for your users, include the following information in your documentation:

- What the document covers.
- What prior knowledge do you expect readers to have.
- What the document doesn't cover.

> Remember that you want to keep your documentation easy to maintain, so don't try to cover everything in the introduction.

### Add navigation

Providing navigation and signposting for your readers ensures they can find what they are looking for and the information they need to get unstuck. 

Clear navigation includes **introduction** and **summary sections**, a **table of contents**, and **links to what you learn next**.

### Prefer task-based headings

Choose a heading that describes the task your reader is working on. Avoid headings that rely on unfamiliar terminology or tools. 

For examples:

- Running the command
- Initializing the project
- Installing the library

### Provide text under each heading

Most readers appreciate at least a brief introduction under each heading to provide some context. Avoid placing a level three heading immediately after a level two heading, as in the image above:

![](/assets/images/tech-writing/headings.png)

### Illustrating

Good graphics engage readers in ways that text can't. Thus, take benefit of images if possible. 

> It is often helpful to write the caption before creating the illustration. Then, create the illustration that best represents the caption. This process helps you to check that the illustration matches the goal.

Prefer adding simple illustrations rather than complex ones and highlighting the important point in the illustration within a sentence, if possible.

## Creating sample code

Good sample code is often the best documentation. Even if your paragraphs and lists are as clear as blue water, programmers still prefer good sample code.

> Good samples are **correct** and **concise** code that your readers can quickly **understand** and **easily reuse** with minimal side effects.

A sample code should meet the following criteria:

- Build without errors.
- Perform the task it claims to perform.
- Be as production-ready as possible. For example, the code shouldn't contain any security vulnerabilities.
- Follow language-specific conventions.
- Should be short, including only essential components.
- Class, method, and variable names should be descriptive.
- Should be avoided for deeply nested code.
- Avoid writing comments about obvious code, but remember that what is obvious to you (the expert) might not be obvious to newcomers.

Good documents explain how to run sample code and the prerequisites for running the code. 

Also, writers should consider describing the expected output or result of sample code, especially for sample code that is difficult to run.

## Summary

Before ending this article, I want to list some tips that I took note during these two technical writing courses:

- Be consistent about terms, words and acronyms.
- Think like your audience.
- Read documents out loud.
- Revise documents after the first draft (also, for second and third one).
- Outline a document before start writing it.
- Prefer task-based headings.
- Consider writing the caption *before* creating the illustration.
- Create concise sample code that is easy to understand.
- Avoid writing comments about *obvious* code.
- Provide not only examples but also anti-examples.
- Prefer simple words
- Answer "what", "why" and "how" questions
- Introduce each list and table
- ...

---

In this article, I wanted to share my takeaways from [Google's Technical Writing Two Course](https://developers.google.com/tech-writing/two). I highly recommend this course, if you are considering improving your writing skills. 

It provides good tips and I hope it improves my writing skills and helps me to well organize my further articles.

Thanks for reading the article. I hope you find it useful. See you at the following one.