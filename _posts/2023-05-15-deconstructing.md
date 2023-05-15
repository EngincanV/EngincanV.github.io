---
layout: post
title:  "Deconstructing Tuples in C#"
date:   2023-05-15 00:00:00 +0000
categories: C# Tuple
image: "/assets/images/tuples/deconstruction.png"
---

In this article, I want to talk about deconstructing Tuples and provide you with a tip. Let's do a quick recap and start by defining the [Tuple type](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-tuples).

## Tuple Type

Tuple can be thought of as a bag of variables that help us to return more than one value in a single method. The following example shows how you can declare a tuple variable, initialize it, and access its data members:

```csharp
//creating a tuple
(string firstname, string lastname) = ("Engincan", "Veske");

//accessing its data members
Console.WriteLine("Full name: " + firstname + " " + lastname);
```

The default names of tuple fields are **Item1, Item2, Item3** and so on. So, we don't have to use tuples as named fields. See the following example for a demonstration:

```csharp
var user = ("Engincan", "Veske");
var firstname = user.Item1; //"Engincan"
var lastname = user.Item2; //"Veske"
```

## Deconstruction

In the examples above, we declared a tuple and access its members. Unpackaging all the items in a tuple is called as **deconstruction**:

```csharp
//Decontruction
var (city, population, area) = QueryCityData("New York City");
```

## Manipulating Decontruction of Tuples

C# allows us to manipulate the deconstruction process by implementing one or more `Deconstruct` methods in a class, a struct, or an interface. 

Assume we have a class named **Coordinate**, which expresses an object's location by X and Y axes:

```csharp
public class Coordinate
{
    public double X { get; set; }
    
    public double Y { get; set; }

    //constructing a coordinate
    public Coordinate(double x, double y) => (X, Y) = (x, y);
}
```

Whenever we need to learn the X or Y axis of an object, we need to create a Coordinate object and access its X or Y property as follows:

```csharp
var coordinate = new Coordinate(10, 10);

var xAxis = coordinate.X;
var yAxis = coordinate.Y;
```

As you can see, we declared two variables to hold X and Y axes. We can use the Tuple type to hold these two values in a single line, to do that we need to define a void `Deconstruct` method:

```csharp
public void Deconstruct(out double x, out double y) => (x, y) = (X, Y);
```

The method returns void, and each value to be deconstructed is indicated by an **out** parameter in the method signature. 

After adding this method to the Coordinate class, our class should be as follows:

```csharp
public class Coordinate
{
    public double X { get; set; }
    
    public double Y { get; set; }

    //construction
    public Coordinate(double x, double y) => (X, Y) = (x, y);

    //deconstruction
    public void Deconstruct(out double x, out double y) => (x, y) = (X, Y);
}
```

> Notice, the Deconstruct method does kind of the opposite operation of the constructor method of the class as its name suggest.

Then, we can get the X and Y axes in a single line by using the power of the Tuple type:

```csharp
var coordinate = new Coordinate(10, 10);

//This is possible, thanks to Deconstruct method
var (x, y) = coordinate;
```

This might not be important, or necessary (and it's not for our example) but it's good to have. You can define a `Deconstruct` method for a user-defined class and take advantage of the Tuple type.

## Conclusion

In this article, I wanted to provide you with a tip to deconstruct tuples for user-defined classes. It's a good feature and can make your code more readable for certain cases. 