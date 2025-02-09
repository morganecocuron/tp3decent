# -*- coding: utf-8 -*-
"""
Created on Mon Feb  3 14:21:51 2025

@author: jean-
"""
# importation des librairies 
import pickle
from flask import Flask, request, jsonify
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Création de l'appli Flask
app = Flask(__name__)


#Entrainement du modele 
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.5, random_state=42)
model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)

# Calcul de l'exactitude du modèle sur l'ensemble de test
accuracy = accuracy_score(y_test, model.predict(X_test))
print(f"Accuracy du modèle DecisionTreeClassifier: {accuracy:.2f}")

# Sauvegarde du modèle entrainé avec pickle 
with open("iris_model.pkl", "wb") as f:
    pickle.dump(model, f)


#Prédiction via API
@app.route('/predict', methods=['GET'])
def predict():
    try:
        #Récupération des 4 caractéritiques du jeu de données depuis les param de la requête url
        features = [float(request.args.get(f"feature{i}")) for i in range(4)]
    except TypeError:
        return jsonify({"error": "Invalid input. Provide 4 numerical features."}), 400
    
    # Prédiction du modèle en utilisant les caractéristiques fournies
    prediction = model.predict([features])[0]
    class_name = ["setosa", "versicolor", "virginica"][prediction]

    # Retour de la prédiction sous forme de réponse JSON
    return jsonify({
        "input": features,
        "prediction": class_name
    })

# Lancement de l'application Flask
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, threaded=True)