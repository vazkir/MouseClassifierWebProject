import time, os
import joblib
from django.conf import settings
import pandas as pd
import numpy as np

# ML Intergration
async def run_ml_model(df):
    # Load the models from disk
    ml_models_path = os.path.join(settings.BASE_DIR, 'mouse_classifier_web') + '/ml_models'
    xgboost_model = joblib.load(f"{ml_models_path}/finalized_web_model.sav")
    scl = joblib.load(f"{ml_models_path}/scalar_web.sav")
    label_encoder = joblib.load(f"{ml_models_path}/label_web_encoder.sav")

    # Needs to be dropped for model to work
    df = df.drop(['sr_no','HostTimestamp', 'NodeTimestamp', 'Z_dps'], axis=1)

    # Standardize the dataset
    X_std = scl.fit_transform(df)

    # Make the ML prediction
    ypred = xgboost_model.predict(X_std)

    # Get the right movement label
    label = label_encoder.inverse_transform(ypred)

    # The class probabilities of the input samples
    yconf = xgboost_model.predict_proba(X_std)

    # Do assume here that all labels are the same for this Prediction
    # Not 100% sure how to fix this otherwise that we know for sure that it matches
    # the "np.max", since taking the index won't probably work due to difference in size
    gesture_classification_short = label[0]
    max_accuracy = np.max(yconf)

    # Match to the right gesture
    gestures = ['Down', 'Left', 'Right', 'Up', 'Wave', 'Spiral']
    match_gestures = [gesture for gesture in gestures if gesture[0] == gesture_classification_short]

    print(f"Prediction: Gesture: f{match_gestures[0]} with accuracy -> float(max_accuracy)")
    return (match_gestures[0], float(max_accuracy))


async def run_train_data():
    # Data transformations which only work on train dataset
    # Still not sure why, only that the pca returns a different numpy arr
    ml_models_path = os.path.join(settings.BASE_DIR, 'mouse_classifier_web') + '/ml_models'
    pca = joblib.load(f"{ml_models_path}/pca_web.sav")
    tsne = joblib.load(f"{ml_models_path}/tsne_web.sav")

    # Read it out
    train_df = pd.read_csv(f"{ml_models_path}/all_web_train.csv")

    # Drop unused columns
    train_df = train_df.drop(['move_type', 'Z_dps'], axis=1)

    # Standardize the dataset
    X_std_train = scl.fit_transform(train_df)

    # Reduce dimensions (speed up) by pca
    pca_data_train = pca.fit_transform(X_std_train)

    # Never tried this one
    # tsne_transformed = tsne.fit_transform(X_std)

    # print("train after pca")
    # print(pca_data_train[:,:2])
