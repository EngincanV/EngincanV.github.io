---
layout: post
title:  "Strongly Typed Enum Pattern"
date:   2022-10-18 00:00:00 +0300
categories: Patterns
image: "/assets/images/strongly-typed-enums-article/book-type.png"
---

In this post, we will take a look at the [Enum type](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/enum) in C#. We should use the Enum type carefully and in this article I aim to show how we can make it more robust by using the **strongly typed enum pattern**.

Let's started.

According to the C# guide:

> The Enum type is a [value type](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types) defined by a set of named constants of the underlying [integral numeric](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types) type.

As seen in the description, Enum type is kind of a [syntactic sugar](https://en.wikipedia.org/wiki/Syntactic_sugar) that improve the readability of the application code. By default, the associated values of enum member are `integer`.

But as with everything, also software development is full of trade-offs. It improves readability but also introduces a vulnerability. Because the Enum type is a numeric type as described above and can be manipulated by any numeric value.

Let's assume, we got an enum named `BookType` as below:

```csharp
public enum BookType
{
    Undefined = 0,
    Adventure = 1,
    History = 2,
    Dystopia = 3,
    Others = 4
}
```

We can use this enum as a parameter and directly take that value and save it to the database:

```csharp
public async Task CreateBookAsync(string bookName, BookType bookType)
{
    var book = new Book(1, bookName, bookType);

    await _bookRepository.InsertAsync(book);
}
```

There is a problem with this code. We used the `BookType` enum to ensure book types will be one of the values that we defined in the enum. So, we expect in our database, the **BookType** column has a value between 0 and 4. 

But, we can call the `CreateBookAsync` method and set the `bookType` parameter as 10 (or any other numeric value) as below:

```csharp
//create a book
await _bookAppService.CreateBookAsync(bookName: "1984", bookType: (BookType)10);
```

When we call the method, there won't be any build-time error and a record will be added to the database. However, this is not our intention and not what we expect.

### How we can improve this and ensure the value will be in the specified range?

We can use the **"Strongly Typed Enum"** pattern to overcome this problem and make it more robust.

> We can use data attributes, such as the Range attribute with Enums where we use it. But, then when we add a new member to the enum then we would also need to change the max value of the range etc..

## Strongly Typed Enum Pattern

Instead of using an Enum type, we can create a class and implement **type-safe enum pattern**:

```csharp
public class BookType
{
    public static BookType Undefined { get; } = new BookType(0, "Undefined");
    public static BookType Adventure { get; } = new BookType(1, "Adventure");
    public static BookType History { get; } = new BookType(2, "History");
    public static BookType Dystopia { get; } = new BookType(3, "Dystopia");
    public static BookType Others { get; } = new BookType(4, "Others");

    public int Number { get; private set; }

    public string Name { get; private set; }

    private BookType(int number, string name)
    {
        Number = number;
        Name = name;
    }
}
```

* Here, first we've defined a class with private constructor. By doing this we are ensuring an object can not be created with this class.
* In addition to that, we are setting book type values as static, thus these values directly can be used.
* Also, we are setting the setter of these class properties' as private, so these properties can not be changed out of this class.

After this implementation, if we call our `CreateBookAsync` method with a different value than what we defined in the `BookType` class, we will get errors.

![](/assets/images/strongly-typed-enums-article/book-type.png)

Now, we can ensure the value of the book type. 

---

Listing enum values are necessary for most of the applications (we might want to use it in a dropdown for instance) and it is an another challenge. This pattern also simplify that. 

We can create a list method in the `BookType` class and use it for listing enum values whenever needed:

```csharp
public class BookType
{
    //...

    public static List<BookType> ListBooks()
    {
        return typeof(BookType).GetProperties(BindingFlags.Public | BindingFlags.Static)
            .Where(bookType => bookType.PropertyType == typeof(BookType))
            .Select(x => (Role)x.GetValue(null, null))
            .OrderBy(x => x.Name)
            .ToList();
    }
}
```

---

So far, we've seen both approaches/usages. Let's list the some of pros and cons of these usages:

| Enum Type | Strongly Typed Enum Pattern |
| --- | --- |
| (+) Easy to use, can be used in entity classes and directly mapped with database tables. | (-) Can not be directly mapped with the database tables. (a numeric value can be used instead) |
| (+) Can be used as bit flags. | (-) Can not be used as bit flags. |
| (-) Can be easily manipulated. | (+) Hard to manipulate and more robust design. |
| (-) Harder to list enum values. (Usually needs to use Description attribute for display name) | (+) A List method can be implemented and values listed. |

---

### Conclusion

In this post, I tried to talk about possible problems we might face, while using the Enum type and implemented the **Strongly Typed Enum** pattern to overcome possible problems. 

The Enum type is used very often in our daily codes, but we need to be aware of its edge cases and use it carefully. I wanted to highlight this and consider about it.

Thanks for reading the post, see you in the next one.
