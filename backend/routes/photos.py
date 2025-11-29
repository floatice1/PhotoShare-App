import os
import uuid
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from models import db, Picture, Category

photos_bp = Blueprint('photos', __name__)

@photos_bp.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{"id": c.id, "name": c.name} for c in categories])

@photos_bp.route('/api/upload', methods=['POST'])
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
        
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
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
