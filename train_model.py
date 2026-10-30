import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import numpy as np
import joblib

path = Path('expense_tracker_dummy_dataset_2500.csv')
df = pd.read_csv(path)

df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
df['Month'] = df['Date'].dt.month
features = ['Category', 'Payment Mode', 'Month']
target = 'Amount'

working = df[['Category', 'Payment Mode', 'Month', 'Amount']].copy()
working = working.dropna(subset=['Category', 'Payment Mode', 'Month', 'Amount'])

X = working[features]
y = working[target]

categorical_features = ['Category', 'Payment Mode']
numeric_features = ['Month']

preprocess = ColumnTransformer([
    ('cat', Pipeline([('imputer', SimpleImputer(strategy='most_frequent')), ('onehot', OneHotEncoder(handle_unknown='ignore'))]), categorical_features),
    ('num', Pipeline([('imputer', SimpleImputer(strategy='median')), ('scaler', StandardScaler())]), numeric_features),
])

models = {
    'linear_regression': LinearRegression(),
    'random_forest': RandomForestRegressor(n_estimators=150, random_state=42),
    'gradient_boosting': GradientBoostingRegressor(random_state=42),
}

best = None
best_name = None
best_score = -999

for name, model in models.items():
    pipe = Pipeline([('preprocess', preprocess), ('model', model)])
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipe.fit(X_train, y_train)
    preds = pipe.predict(X_test)
    score = r2_score(y_test, preds)
    if score > best_score:
        best_score = score
        best = pipe
        best_name = name
    print(name, 'R2=', round(score, 4), 'MAE=', round(mean_absolute_error(y_test, preds), 2), 'RMSE=', round(np.sqrt(mean_squared_error(y_test, preds)), 2))

cv_scores = cross_val_score(best, X, y, cv=5, scoring='r2')
print('BEST_MODEL', best_name, 'CV_R2', round(cv_scores.mean(), 4))

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
best.fit(X_train, y_train)
preds = best.predict(X_test)
metrics = {
    'r2': r2_score(y_test, preds),
    'mae': mean_absolute_error(y_test, preds),
    'mse': mean_squared_error(y_test, preds),
    'rmse': np.sqrt(mean_squared_error(y_test, preds)),
}
print('FINAL', metrics)

out_dir = Path('Fintracker_Backend/insights/models')
out_dir.mkdir(parents=True, exist_ok=True)
joblib.dump(best, out_dir / 'expense_model.joblib')
joblib.dump(features, out_dir / 'feature_names.joblib')
joblib.dump(metrics, out_dir / 'metrics.joblib')
print('SAVED', out_dir)
