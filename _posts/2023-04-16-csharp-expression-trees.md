---
layout: post
title:  "C# - Expression Trees"
date:   2023-04-15 00:00:00 +0000
categories: C# Expression-Trees 
---

**Expression Trees** is one of the most important and frequently used feature of C# language. Nevertheless, it's overlooked by most developers. Most of us consume some codes that use Expression Trees from some popular libraries such as *EntityFramework Core* and *AutoMapper* without even knowing it. Therefore, I wanted to create an article to describe what it is and why we even need to know or use it.

In this article, I will give you an overview of what expression trees are, what are their benefits, and so on... It's a large topic and it can be hard to grasp at the first glance. Therefore, I will try to describe it briefly and then by showing some examples demonstrate what it is.

## What is an expression tree?

An **expression** is a value, or anything that executes and produces a certain value. As an example, think of a simple multiplication operation, for example, `10 * 10`. It's an expression and consists of some parts. It consists of a *constant number*, a *plus operator*, and another *constant number*. So, as you can see we can represent an expression, by determining what it consists of. 

Expression Trees work in the same mentality. It represents code in a tree like data structure, where each node is an **expression**, a *method call* or a *binary operation* (like multiplication, an operation that consists of three parts: left side, right side, and an operator).

> Expression trees are based on the same structures that a compiler uses to analyze code and generate the compiled output.

Let's consider a simple method that sums two numbers as follows:

```csharp
public int Sum(int n1, int n2) => n1 * n2;

Sum(1, 2);
```

Expression tree for this method will be generated as follows:

![](/assets/images/expression-trees/expression-tree.png)

Here, as you can see, at the highest level we have a simple *Sum* method, which is itself made up of other expressions, which are also made up of other expressions, and so on... This shows us a hierarchical structure and can be interpreted by us programmatically. This is what we call an *expression tree* in general term: "**a data-structure that defines the code**".

We can do the same addition operation by using the Expression API. We can use the `Expression` class located under the `System.Linq.Expressions` namepace, and produces the same result:

```csharp
var number1 = Expression.Constant(1, typeof(int));
var number2 = Expression.Constant(2, typeof(int));

var total = Expression.Add(number1, number2);
var lambda = Expression.Lambda(total);

var result = (int)lambda.Compile().DynamicInvoke(); //produce same result with Sum method above (Sum(1, 2))
```

In the example above, we built an expression tree by using the Expression API, compiled it and evaluate it using a delegate.

**Notice**, we created a lambda expression first by using the `Expression.Lambda` method, this is equal to `Expression<Func<int>>` type, so at that point, the expression just holds the delegate, and waits for it to be compiled and invoked. Before, being compiled and invoked it was the representation of the code as *expression tree*. You can imagine it as a wrapper for our delegate (method).

This expression is not useful right now, as I mentioned just before. Because we want to be able to evaluate it instead of just creating an expression tree and examining it. To evaluate the expression, we first need to compile it by using the `Expression<TDelegate>.Compile` method, converts the expression tree into an executable code and produces a delegate that represents the lambda expression. Then, we have the method and the only thing we need to do is, call it, we can use the `DynamicInvoke` method to execute the method.

> Note: The `Compile` method produces a delegate of type *TDelegate* at runtime.

## Use Cases of Expression Trees

I think we have an overall knowledge of *Expression Trees* so far. Let's list some use-cases of Expression Trees:

* We can analyze and change the expression to our needs, re-create or manipulate them if its needed.
* We can write transpilers, for example, we can define our code in C# and transpile it into SQL, as EntityFramework Core providers do. 
* We can use it for code generation.
* We can optimize reflection calls in our code.
* and more...

There are more use-cases of expression trees. These are some of them that came to my mind. 

Let's make an example with the `ExpressionVisitor` class, which is provided by the language itself and allow us to easily examine/re-create expressions.

## `ExpressionVisitor` Class

This class is a base abstract class that can be used to create more specialized classes whose functionality requires **traversing**, **examining** or **copying** an expression tree. Expression trees are **immutable**, so they can't be updated. Therefore, all of these classes' methods return an `Expression` class, which can be a new expression as the modified version of the old expression.

Let's see it with a simple example. Assume, we have a method that gets an argument and prints it to our custom logger:

```csharp
Action<string> Print = (text) => MyCustomLogger.LogInformation(text);

Print("Hello World!");
```

If we want to change this method and log to a file, we can achieve this easily by using the `ExpressionVisitor` class:

```csharp
public class MyExpressionVisitor : ExpressionVisitor
{
    protected override Expression VisitMethodCall(MethodCallExpression node)
    {
        if (node.Method == typeof(MyCustomLogger).GetMethod(nameof(MyCustomLogger.LogInformation)))
        {
            var newMethod = typeof(MyFileLogger).GetMethod(nameof(MyFileLogger.Log));
            
            return Expression.Call(newMethod!, node.Arguments);
        }
        
        return base.VisitMethodCall(node);
    }
}
```

Here, we have just changed the `MyCustomLogger.LogInformation` method with `MyFileLogger.Log` method, by visiting the method call nodes and re-writing the expression. As you may notice, this method takes a `MethodCallExpression`, which represents our `MyCustomLogger.LogInformation` method in the expression tree and also represents other methods in the expression tree.

This method is being called everytime a method call is traversied in the expression tree for the related expression. Thus, we can check if the method is what we are expected, which is `MyCustomLogger.LogInformation` in our case and then change the expression with an another method expression.

```csharp
Expression<Action<string>> PrintExpr = (text) => MyCustomLogger.LogInformation(text);

var changedExpr = ((Expression<Action<string>>) new MyExpressionVisitor().Visit(PrintExpr));

changedExpr.Compile().Invoke("Hello World"); //compile into a delegate and invoke it
```

When we compile the expression, it will be a delegate that we can invoke. Then, when we invoked the delegate we should see the output as follows for our example:

```txt
MyFileLogger [Information] -> Hello World
```

We can inherit from `ExpressionVisitor` class, whenever we want to visit nodes and change them. In the example above, we just simply changed a method call, but the expression visitor is not limited to such simple expression modifications, you can do so many things by overriding its methods such as `Visit`, `VisitConditional`, `VisitParameter` and more. After this simple example and understanding the `ExpressionVisitor` class, now we can see some real world examples of **Expression Trees** in the next section.

## Expression Trees in Entity Framework Core

Entity Framework's LINQ APIs accept Expression trees as the arguments for the LINQ Query Expression Pattern. You can see the following method signature from EF core repository:

***Example:***

```csharp
public static IQueryable<TSource> Where<TSource>(this IQueryable<TSource> source, Expression<Func<TSource, bool>> predicate)
```

> This is an extension method for `IQueryable<Source>` and as you can see it accepts an expression as its argument. When you specify a predicate, in this method, it will not be executed until it's needed. Actually, this is one of the main differences between `IQueryable` and `IEnumerable` interfaces. Here, `Expression<Func<TSource, bool>>` is just holding the delegate and waiting to be compiled and invoked. On other hand, extension methods of `IEnumerable` accept delegates directly and execute them. This is a good point, to be aware of.

EF Core uses the `ExpressionVisitor` class frequently in its code-base. It's needed to examine nodes, optimize the method calls and manipulate them. It also gets the benefit of Expression Trees by transpiring C# code into SQL.

I will share some classes with their links, that inherit from `ExpressionVisitor` class, you can also check the [dotnet/efcore](https://github.com/dotnet/efcore) repository for other examples:

[1-) SqlExpressionVisitor.cs](https://github.com/dotnet/efcore/blob/65bb6b03555837ee77a5ac552c019b8ab6cc9105/src/EFCore.Cosmos/Query/Internal/SqlExpressionVisitor.cs#L12)

```csharp
public abstract class SqlExpressionVisitor : ExpressionVisitor
{
    protected override Expression VisitExtension(Expression extensionExpression)
    {
        switch (extensionExpression)
        {
            //...

            case SqlBinaryExpression sqlBinaryExpression:
                return VisitSqlBinary(sqlBinaryExpression);

            case SqlConstantExpression sqlConstantExpression:
                return VisitSqlConstant(sqlConstantExpression);

            case SqlUnaryExpression sqlUnaryExpression:
                return VisitSqlUnary(sqlUnaryExpression);

            case SqlConditionalExpression sqlConditionalExpression:
                return VisitSqlConditional(sqlConditionalExpression);

            case SqlParameterExpression sqlParameterExpression:
                return VisitSqlParameter(sqlParameterExpression);

            case InExpression inExpression:
                return VisitIn(inExpression);

            case SqlFunctionExpression sqlFunctionExpression:
                return VisitSqlFunction(sqlFunctionExpression);

            case OrderingExpression orderingExpression:
                return VisitOrdering(orderingExpression);
        }

        return base.VisitExtension(extensionExpression);
    }

    //other methods...
}
```

[2-) QueryableMethodTranslatingExpressionVisitor.cs](https://github.com/dotnet/efcore/blob/main/src/EFCore/Query/QueryableMethodTranslatingExpressionVisitor.cs)

[3-) QueryableMethodTranslatingExpressionVisitor.cs](https://github.com/dotnet/efcore/blob/65bb6b03555837ee77a5ac552c019b8ab6cc9105/src/EFCore/Query/QueryableMethodTranslatingExpressionVisitor.cs#L21)

### Conclusion

In this article, I tried to describe what expression trees are, why we might need them, and show you some code. I think Expression trees are a very interesting feature and can be helpful if you want to analyze a certain expression (it can be anything), and change it accordingly. It can be used for analyzing, code generation, reflection, meta-programming and so on. 

---

Thanks for reading the post, see you in the next one.