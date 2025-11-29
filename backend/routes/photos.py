import os
import uuid
from flask import Blueprint, jsonify, request, current_app, send_file
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from sqlalchemy import desc
from PIL import Image

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

    if not title or len(title.strip()) == 0:
        return jsonify({"error": "Title is required"}), 400
    if len(title) > 100:
        return jsonify({"error": "Title is too long"}), 400

    if file:
        filename = secure_filename(file.filename)
        unique_filename = str(uuid.uuid4()) + "_" + filename # To avoid name collisions
        
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(save_path)

        # Read image to get resolution and format
        try:
            with Image.open(save_path) as img:
                width, height = img.size
                img_format = img.format # JPEG, PNG...
                resolution_str = f"{width}x{height}"
        except Exception as e:
            print(f"Error reading image: {e}")
            resolution_str = "Unknown"
            img_format = "Unknown"

        new_picture = Picture(
            title=title,
            file_path=unique_filename,
            author=current_user,
            size_kb=os.path.getsize(save_path) // 1024, # Size in KB
            resolution=resolution_str,
            format=img_format
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

@photos_bp.route('/api/photos', methods=['GET'])
def get_all_photos():
    photos = Picture.query.order_by(desc(Picture.uploaded_at)).all()
    
    output = []
    for p in photos:
        output.append({
            "id": p.id,
            "title": p.title,
            "image_url": f"http://localhost:5000/uploads/{p.file_path}",
            "author": p.author.username,
            "downloads": p.downloads_count,
            "categories": [c.name for c in p.categories],
            "date": p.uploaded_at.strftime("%d.%m.%Y"),
            "resolution": p.resolution,
            "size": f"{p.size_kb} KB",
            "format": p.format
        })
    
    return jsonify(output)

@photos_bp.route('/api/photos/<int:photo_id>/download', methods=['GET'])
def download_photo(photo_id):
    photo = db.session.get(Picture, photo_id)
    if not photo:
        return jsonify({"error": "Not found"}), 404
    
    is_author = current_user.is_authenticated and current_user == photo.author

    if not is_author:
        photo.downloads_count += 1
        db.session.commit()
    else:
        print(f"User {current_user.username} downloaded their own photo. Count did not increase.")
    
    
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], photo.file_path)
    return send_file(path, as_attachment=True, download_name=f"{photo.title}.{photo.format.lower()}")

@photos_bp.route('/api/photos/<int:photo_id>', methods=['DELETE'])
@login_required
def delete_photo(photo_id):
    photo = db.session.get(Picture, photo_id)
    if not photo:
        return jsonify({"error": "Not found"}), 404
    
    is_owner = photo.author == current_user
    is_admin = current_user.role in ['admin', 'moder']

    if not is_owner and not is_admin:
        return jsonify({"error": "Permission denied"}), 403

    try:
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], photo.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")

    db.session.delete(photo)
    db.session.commit()
    
    return jsonify({"message": "Deleted successfully"}), 200
