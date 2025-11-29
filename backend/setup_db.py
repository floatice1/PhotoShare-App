from app import app
from models import db, User, Category
from werkzeug.security import generate_password_hash

def create_initial_data():
    with app.app_context():
        db.create_all()
        print("✅ Tables created!")

        if not Category.query.first():
            categories = ['Nature', 'Cars', 'Memes', 'Tech', 'Animals', 'Space']
            for name in categories:
                db.session.add(Category(name=name))
            print("✅ Categories added!")

        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', role='admin', 
                         password_hash=generate_password_hash('admin'))
            moder = User(username='mod', role='moder', 
                         password_hash=generate_password_hash('mod'))
            user = User(username='user', role='user', 
                        password_hash=generate_password_hash('user'))

            db.session.add_all([admin, moder, user])
            print("✅ Users (Admin, Mod, User) added!")

        db.session.commit()
        print("🚀 Database setup complete!")

if __name__ == '__main__':
    create_initial_data()