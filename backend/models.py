from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from flask_login import UserMixin

db = SQLAlchemy()

# One picture can have many categories, one category - many pictures
picture_category = db.Table('picture_category',
    db.Column('picture_id', db.Integer, db.ForeignKey('picture.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('category.id'), primary_key=True)
)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user') # 'user', 'moder', 'admin'
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Relationship: a user has many pictures
    pictures = db.relationship('Picture', backref='author', lazy=True)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class Picture(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    size_kb = db.Column(db.Integer)
    format = db.Column(db.String(10))
    resolution = db.Column(db.String(20))
    downloads_count = db.Column(db.Integer, default=0)
    uploaded_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Relationship with categories through the association table
    categories = db.relationship('Category', secondary=picture_category, lazy='subquery',
        backref=db.backref('pictures', lazy=True))