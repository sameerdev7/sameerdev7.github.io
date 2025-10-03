---
layout: post
title: "Understanding Neural Networks"
date: 2025-01-15 14:00:00 +0530
excerpt: "A beginner-friendly guide to neural networks and deep learning"
description: "Learn the basics of neural networks, including how they work and common applications in AI"
author: Sameer Sayyad
usemathjax: true
---

## Introduction

Neural networks are at the heart of modern AI. In this post, we'll explore...

## What Are Neural Networks?

Neural networks are computational models inspired by the human brain...

### Key Components

1. **Input Layer**: Receives data
2. **Hidden Layers**: Process information
3. **Output Layer**: Produces results

$$
f(x) = \frac{1}{1 + e^{-x}}
$$

$$
\nabla_\theta J(\theta) = \frac{1}{m} \sum_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) x^{(i)}
$$

## Example Code

Here's a simple neural network in Python:
```python
import numpy as np

class NeuralNetwork:
    def __init__(self):
        self.weights = np.random.rand(3, 1)
    
    def forward(self, X):
        return np.dot(X, self.weights)
```