import os
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from models import Category, Picture, User, db
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Enable CORS for the frontend running on localhost:5173
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# Specify where the database is located (the site.db file will appear nearby)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'super-secret-key-for-dev' # For sessions

# Specify the folder for uploading pictures
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    new_user = User(
        username=username,
        password_hash=generate_password_hash(password),
        role='user'
    )
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        login_user(user)
        return jsonify({
            "message": "Login successful",
            "user": {"username": user.username, "role": user.role}
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"}), 200

@app.route('/api/me', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            "authenticated": True,
            "user": {"username": current_user.username, "role": current_user.role, "id": current_user.id}
        })
    else:
        return jsonify({"authenticated": False}), 200

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{"id": c.id, "name": c.name} for c in categories])

@app.route('/api/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    title = request.form.get('title')
    categories_ids = request.form.get('categories') 

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        unique_filename = str(uuid.uuid4()) + "_" + filename # To avoid name collisions
        
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(save_path)

        new_picture = Picture(
            title=title,
            file_path=unique_filename,
            author=current_user,
            size_kb=os.path.getsize(save_path) // 1024 # Size in KB
        )

        # Associate categories if provided 
        if categories_ids:
            cat_list = [int(id) for id in categories_ids.split(',') if id]
            for cat_id in cat_list:
                category = db.session.get(Category, cat_id)
                if category:
                    new_picture.categories.append(category)

        db.session.add(new_picture)
        db.session.commit()

        return jsonify({"message": "File uploaded successfully!"}), 201
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)