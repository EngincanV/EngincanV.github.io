---
layout: post
title:  "Mutation Testing in C# with Stryker"
date:   2024-02-11 00:00:00 +0300
categories: C# .NET Stryker
image: "/assets/images/stryker/cover-image.png"
---

In this article, I describe what mutation testing is, which tools we have for mutation testing in C# and finally I will show you an example of mutation testing, evaluating a mutation testing score and improving it.

## What is mutation testing?

Mutation testing is a software testing technique that changes some logical operators into their opposite and runs the tests against them, evaluates the test results, and sees if our code can detect the mutation or not.

Let's break that down and see it in an example. Assume that, you have an add operation, and simply summing two numbers. If we call these numbers as *number1* and *number2*, then the operation can be expressed as:

```csharp
var result = number1 + number2;
```

If we apply mutation testing to this case, then we need to test it against the opposite, which is the **extraction** operation:

```diff
  var result = number1 + number2;
+ var result = number1 - number2;
```

This is what basically mutation testing does, it typically involves introducing small, deliberate errors (mutations) into the source code, such as changing operators, variables, or modifying conditional statements, and then running the test suite to see if the tests can detect and fail due to these mutations (survived ❌ or killed ✅).

For example, if you sum 1 and 0 as numbers, you would have 1 as the result, but as you can notice, it's the same if you extract these two numbers, the result would be 1 again. So, for this example, it means that you can't use numbers as 1 and 0 alone, and you need to add additional test values to fully test it and I will show you that in the next section!

## Mutation Testing with Stryker

[Stryker.NET](https://github.com/stryker-mutator/stryker-net) is a mutation testing tool for .NET that helps you detect weaknesses in your test suites and improve your tests' quality.

Stryker provides a .NET global tool to easily use it, you can install it globally by using the following command:

```bash
dotnet tool install -g dotnet-stryker
```

After you have installed the global tool, you can write your code and tests, and use the `dotnet-stryker` command for mutation testing for a certain test, or the whole system in the test.

Let's write code for adding two numbers. For that purpose, we can create a class as below:

```csharp
namespace MyProject
{
    public class Calculator
    {
        public static int Sum(int number1, int number2) => number1 + number2;
    }
}
```

Then, we can create a test project, for example, a xunit project (`dotnet new xunit -o MyProjectTests`), and write tests for this method:

```csharp
using MyProject;
using Shouldly;

namespace MyProjectTests;

public class MyProjectTests
{
    [Theory]
    [InlineData(1, 0, 1)]
    public void Sum(int number1, int number2, int expected)
    {
        Calculator.Sum(number1, number2).ShouldBe(expected);
    }
}
```

> Note: In this test, I used the [Shouldly](https://docs.shouldly.org/) for the assertion framework, which allows me to use the `ShouldBe` extension method. Also, I created a class library and created the `Calculator` class in that project and added the class library reference to the test project.

In this simple test, I provided two numbers as parameters, 1 and 0, and also checked if the sum operation was successful and correct by asserting the result with the expected value.

If I execute the `dotnet test` command, the test will be successfully run:

```bash
Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: < 1 ms - MyProjectTests.dll (net8.0)
```

Our code and its test are working correctly, but let's also apply mutation testing for further evaluation. For that purpose, we can run the following command under the test project directory:

```bash
dotnet-stryker
```

After we run the command, Stryker will create mutators for our test and check how many of them are survived and how many of them killed and then evaluate a mutation testing score for us:

![](/assets/images/stryker/stryker-test-1.png)

As you can see from the output, it created a mutator for our test and it survived, which means our test is not strong enough! 

Also, it generated a report for us, so let's check the **mutation-report.html** page:

![](/assets/images/stryker/mutation-test-result-1.png)

As you can see, it took the '+' operator and converted it to the '-' operator and runned the test again, and checked if it's survived or killed. 

Unfortunately, in our case, because of the testing parameters, it's survived. To fix this weakness, let's go back to our test and add additional testing values.

```diff
public class MyProjectTests
{
    [Theory]
    [InlineData(1, 0, 1)]
+   [InlineData(2, 3, 5)]
    public void Sum(int number1, int number2, int expected)
    {
        Calculator.Sum(number1, number2).ShouldBe(expected);
    }
}
```

We have added additional test values, and thanks to that, if we apply mutation testing again to our test, we will see everything now works as expected.

```bash
dotnet-stryker
```

![](/assets/images/stryker/stryker-test-2.png)

As you can see from the output, now our **mutation score is 100.00%**. Let's also check it from the mutation-report:

![](/assets/images/stryker/mutation-test-result-2.png)

> Stryker.NET is not just limited to providing simple mutators for only arithmetic operators, it also supports a variety of other mutators. You can find the full list at [https://stryker-mutator.io/docs/stryker-net/mutations/](https://stryker-mutator.io/docs/stryker-net/mutations/).

## Conclusion

In this post, I discussed what mutation testing is and showed you a very basic example. Mutation testing can especially be useful for methods that do complex math operations and can improve the strength of the test suites.

It's a great testing strategy and applying it to your test cases can prevent unexpected errors that might occur later on.

Also, mutation testing provides a more thorough evaluation of a test suite compared to code coverage metrics alone. It helps identify areas where tests may be weak or missing, allowing developers to enhance their test suite and increase the overall reliability of the software.