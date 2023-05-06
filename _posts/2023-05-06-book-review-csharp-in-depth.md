---
layout: post
title:  "Book Review: C# in Depth"
date:   2023-05-06 00:00:00 +0000
categories: Book-Review C# C#-in-depth
---

In this article, I will be sharing my thoughts on one of the most popular C# books: [C# in Depth](https://www.amazon.com/C-Depth-4E-Jon-Skeet/dp/1617294535). I haven't finished the book yet and currently reading it, but I read more than half of the book and thought I could briefly mention my first impressions about the book.

| <img src="/assets/images/book-review/csharp-in-depth.jpg" alt="C# in Depth" width="200px"/> |
|:--:|
| <b>C# in Depth, Fourth Edition by Jon Skeet.</b>|

## C# in Depth, Fourth Edition

C# in Depth is written by Jon Skeet, who is a well-known developer and currently the top StackOverflow Contributor. It's a pretty long book and covers the pretty large topic and in my opinion, it indeed covers it "in-depth" if we are talking about the evolving of the C# language.

This book is an engaging guide that reveals the potential of the C# language. In this book, Jon deep dives into the C# language and mention the features through C# 1 to C# 7 and their underlying motives. Also, he mentions C# 8 and beyond, which was not released when he wrote the book's fourth edition. 

The book contains 4 parts and 15 sections as follows:

1. C# in Context
   1. Survival of the sharpest
2. C# 2-5
   1. C# 2
   2. C# 3: LINQ and everything that comes with it
   3. C# 4: Improving interoperability
   4. Writing asynchronous code
   5. Async implementation
   6. C# 5 bonus features
3. C# 6
   1. Super-sleek properties and expression-bodied members
   2. Stringy features
   3. A smörgåsbord of features for concise code
4. C# 7 and Beyond
   1. Composition using tuples _(**I'm currently reading this section**)_
   2. Deconstruction and pattern matching
   3. Improving efficiency with more pass by reference
   4. Concise code in C# 7
   5. C# 8 and beyond

Let's talk about the good and bad sides of the book, what I have learned by reading it, who should read this book etc...

### Good Sides

* Jon mentions the features in a very conversational way and that makes the book quite readable.
* Well detailed coverage of the language features of C#.
* The book is chronologically ordered, therefore you can really see the evolution of the language.
* New features and their motive (why this feature is needed, how it helps us with our daily code base, should we use it, etc.) are described very well.
* Simple and great examples to demonstrate the language features.
* LINQ and Async sections are really great and informative. 
* In this book, we see compiler-generated code frequently and this is a good way to see what happens under the hook. This is really important to be confident about the code you are writing and be aware of what is going on.

### Bad Sides

I really liked the book in general and I think it only has one bad side:

* _dynamics_ and _DLR_ is mentioned briefly in the book. For such a complex topic, I would expect more details because I felt like the book is mentioned these topics in a poor way and in a bit too fast. 

In my opinion, except that the book does what it promises.

### What I have learned?

Frankly speaking, more than I would have expected. Specifically, I use LINQ in my daily code frequently, but I never really looked into it in details, after reading the LINQ section now I have a much more thorough understanding of LINQ and how all the pieces of the language fit together to make it work.

I learned good tips about certain features with their caveats. Also, after reading the _dynamics_ and _DLR_ section of this book, I have found and read great articles on these features and it was good that this book force me to learn about these features in depth.

> I suggest you after reading each section, give pause and think about the section and apply the features code in the book. This will make it more memorable and will help you to use it in your daily code style. Even if you know the feature, it's good to give pause and try it. Especially, checking the generated code by the compiler. At least, this is what I have done while reading the book. So, think of the book as a ladder to make you a more confident and knowledgeable developer by deep diving into the language.

### Who should read this book?

Overall, I would highly recommend this book to every C# developer. A developer could easily raise both their skill level, confidence and knowledge of C#. I think any advanced C# developer should have plenty to learn from it as well and don't think it just explains the features briefly, it gives you more than that.

So, if you are willing to learn internal of the C# language and want to learn motives under certain features in C#, version by version, I think this book it's what you are looking for. If you aren't curious about those things, then you don't need to read this book.

## Conclusion

In this article, I mentioned about the book I'm currently reading: "C# in Depth, Fourth Edition" by Jon Skeet. I highly recommend this book for every C# developer.

---

Thanks for reading and see you in the next one!