---
layout: post
title:  "Reusing and Optimizing Machine Learning Models in .NET"
date:   2024-05-17 00:00:00 +0300
categories: Machine-Learning Sentiment-Analysis Best-Practises
image: "https://raw.githubusercontent.com/abpframework/abp/084fb6c00e76ae9c304c7e9d72c0f4f678ff2249/docs/en/Community-Articles/2024-05-10-Sentiment-Analysis-within-ABP-Based-Application/cover-image.png"
---

In my [previous article](https://community.abp.io/posts/sentiment-analysis-within-abpbased-application-lbsfkoxq), I showed you how to apply sentiment analysis in a .NET Application (an ABP-based application) within a practical and simple example. In the example, we created a **spam detection service** and tried to detect spam content whenever a new comment has been added or an existing comment has been updated. 

Here is the full-code of the `SpamDetector` service for a quick recap:

```csharp
public async Task CheckAsync(string text)
{
    var dataPath = Path.Combine(Environment.CurrentDirectory, "ML", "Data", "spam_data.csv");

    var mlContext = new MLContext();

    //Step 1: Load Data 👇
    IDataView dataView = mlContext.Data.LoadFromTextFile<SentimentAnalyzeInput>(dataPath, hasHeader: true, separatorChar: ',');

    //Step 2: Split data to train-test data 👇
    DataOperationsCatalog.TrainTestData trainTestSplit = mlContext.Data.TrainTestSplit(dataView, testFraction: 0.2);
    IDataView trainingData = trainTestSplit.TrainSet; //80% of the data.
    IDataView testData = trainTestSplit.TestSet; //20% of the data.

    //Step 3: Common data process configuration with pipeline data transformations + choose and set the training algorithm 👇
    var estimator = mlContext.Transforms.Text.FeaturizeText(outputColumnName: "Features", inputColumnName: nameof(SentimentAnalyzeInput.Message))
        .Append(mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(labelColumnName: "Label", featureColumnName: "Features"));

    //Step 4: Train the model 👇
    ITransformer model = estimator.Fit(trainingData);

    //Step 5: Predict 👇
    var sentimentAnalyzeInput = new SentimentAnalyzeInput
    {
        Message = text
    };

    var predictionEngine = mlContext.Model.CreatePredictionEngine<SentimentAnalyzeInput, SentimentAnalyzeResult>(model);
    var result = predictionEngine.Predict(sentimentAnalyzeInput);
    if (IsSpam(result))
    {
        throw new UserFriendlyException("Spam detected! Please update the message!");
    }
}

private static bool IsSpam(SentimentAnalyzeResult result)
{
    //1 -> spam / 0 -> ham (for 'Prediction' column)
    return result is { Prediction: true, Probability: >= 0.5f };
}
```

Here, we have done the following things:

1. **Loaded the data.**
2. **Split the data as training and testing datasets.** (So, we can evaulate our models accuracy later on.)
3. **Made data transformations, convert the text-based data into numeric vectors, and then choose a training algoritm** (Binary Classification with SdcaLogicticRegression algorithm)
4. **Train the model.**
5. **Predict a result with the sample data.**

These steps are pretty common flows to build-up a machine learning model and consume in applications. But, if you look closely at this flow and the spam detection service, you will notice, in each time we are loading the data, splitting the data as training and testing datasets, making data transformations and binary classification, training the model and finally predict the final result. Actually, we can simplify this flow, reuse and optimize our trained machine learning model. Let's investigate how we can do this, in the next section.

## How to reuse trained machine learning models?

Once the model is trained and evaulated, we can save the trained model and use it directly in the further uses. In this way, you don't have to retrain the model every time when you want to make predictions. Here is how you can save your trained model by using the ML.NET Framework:

```csharp
    //👇 Save/persist the trained model to a .ZIP file. 👇
    var ModelPath = Path.Combine(Environment.CurrentDirectory, "ML", "Data", "spam_data_model.zip");

    mlContext.Model.Save(model, trainingData.Schema, ModelPath);
```

* This code snippet uses the `Save` method of the **MLContext.Model** property. This method used to save the trained model into the specified zip file-path.
* `trainingData.Schema` provides the schema of the data the model was trained on, ensuring compatibility when loading the model for predictions.

You need to add the code above between the train and predict steps, so the final code should be as follows:

```csharp
public async Task CheckAsync(string text)
{
    var dataPath = Path.Combine(Environment.CurrentDirectory, "ML", "Data", "spam_data.csv");

    var mlContext = new MLContext();

    //Step 1: Load Data 👇
    IDataView dataView = mlContext.Data.LoadFromTextFile<SentimentAnalyzeInput>(dataPath, hasHeader: true, separatorChar: ',');

    //Step 2: Split data to train-test data 👇
    DataOperationsCatalog.TrainTestData trainTestSplit = mlContext.Data.TrainTestSplit(dataView, testFraction: 0.2);
    IDataView trainingData = trainTestSplit.TrainSet; //80% of the data.
    IDataView testData = trainTestSplit.TestSet; //20% of the data.

    //Step 3: Common data process configuration with pipeline data transformations + choose and set the training algorithm 👇
    var estimator = mlContext.Transforms.Text.FeaturizeText(outputColumnName: "Features", inputColumnName: nameof(SentimentAnalyzeInput.Message))
        .Append(mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(labelColumnName: "Label", featureColumnName: "Features"));

    //Step 4: Train the model 👇
    ITransformer model = estimator.Fit(trainingData);

    //👇 Save/persist the trained model to a .ZIP file. 👇
    var modelPath = Path.Combine(Environment.CurrentDirectory, "ML", "Data", "spam_data_model.zip");

    mlContext.Model.Save(model, trainingData.Schema, modelPath);

    //Step 5: Predict 👇
    var sentimentAnalyzeInput = new SentimentAnalyzeInput
    {
        Message = text
    };

    var predictionEngine = mlContext.Model.CreatePredictionEngine<SentimentAnalyzeInput, SentimentAnalyzeResult>(model);
    var result = predictionEngine.Predict(sentimentAnalyzeInput);
    if (IsSpam(result))
    {
        throw new UserFriendlyException("Spam detected! Please update the message!");
    }
}
```

When our `SpamDetector` service is executed once, then the model will be trained and saved into a .ZIP file. After saving the model, you can load it to make predictions on new data (input). This is especially useful for deploying the model and use in a production environement, it's more efficient and reusable.

Before loading the data from the ZIP file, we can make a check to see if the file is exists or not and if it exits, then we can load the data by using the `Load` method of the **MLContext.Model** property as follows:

```csharp
        //👇 Load the model from the .ZIP file 👇
        if (File.Exists(modelPath))
        {
            model = mlContext.Model.Load(modelPath, out DataViewSchema inputSchema);
        }
```

Here is the final version of our `SpamDetector` service:

```csharp
public async Task CheckAsync(string text)
{
    var mlContext = new MLContext();

    var modelPath = Path.Combine(Environment.CurrentDirectory, "ML", "Data", "spam_data_model.zip");
    ITransformer model;

    //👇 Load the model from the .ZIP file, if the trained data is already saved into the ZIP file. 👇
    if (File.Exists(modelPath))
    {
        model = mlContext.Model.Load(modelPath, out DataViewSchema inputSchema);
    }
    else
    {
        var dataPath = Path.Combine(Environment.CurrentDirectory, "ML", "Data", "spam_data.csv");

        //* Load Data 👇
        IDataView dataView = mlContext.Data.LoadFromTextFile<SentimentAnalyzeInput>(dataPath, hasHeader: true, separatorChar: ',');

        //* Split data to train-test data 👇
        DataOperationsCatalog.TrainTestData trainTestSplit = mlContext.Data.TrainTestSplit(dataView, testFraction: 0.2);
        IDataView trainingData = trainTestSplit.TrainSet; //80% of the data.
        IDataView testData = trainTestSplit.TestSet; //20% of the data.

        //* Common data process configuration with pipeline data transformations + choose and set the training algorithm 👇
        var estimator = mlContext.Transforms.Text.FeaturizeText(outputColumnName: "Features", inputColumnName: nameof(SentimentAnalyzeInput.Message))
            .Append(mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(labelColumnName: "Label", featureColumnName: "Features"));

        //* Train the model 👇
        model = estimator.Fit(trainingData);

        //* Save/persist the trained model to a .ZIP file. 👇
        mlContext.Model.Save(model, trainingData.Schema, modelPath);
    }

    //* Predict 👇
    var sentimentAnalyzeInput = new SentimentAnalyzeInput
    {
        Message = text
    };

    var predictionEngine = mlContext.Model.CreatePredictionEngine<SentimentAnalyzeInput, SentimentAnalyzeResult>(model);
    var result = predictionEngine.Predict(sentimentAnalyzeInput);
    if (IsSpam(result))
    {
        throw new UserFriendlyException("Spam detected! Please update the message!");
    }
}
```

* First, check if the model is already trained once and saved into the specified .zip file and if it is, then directly load the trained model and make predictions.
* Otherwise, it means that the model is not trained and saved before, and we can train the model and then save it into a ZIP file and reuse it for futher uses.

## Conclusion

In this article, I showed you how to reuse the trained machine learning models. It's essential to save the trained model for future use and a must for the production ready code. You can get the full source code of today's example at [https://github.com/EngincanV/SentimentAnalysisDemo/pull/1](https://github.com/EngincanV/SentimentAnalysisDemo/pull/1) and also read my previous article at [https://community.abp.io/posts/sentiment-analysis-within-abpbased-application-lbsfkoxq](https://community.abp.io/posts/sentiment-analysis-within-abpbased-application-lbsfkoxq).

Thanks for reading and see you in the next one :)