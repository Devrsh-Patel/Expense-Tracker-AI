from django.db import migrations

def seed_categories(apps, schema_editor):
    Category = apps.get_model('expenses', 'Category')
    categories = [
        {'id': 1,  'name': 'Food and Dining',   'icon': '🍽️', 'color': '#FF6B6B'},
        {'id': 2,  'name': 'Groceries',         'icon': '🛒',  'color': '#4ECDC4'},
        {'id': 3,  'name': 'Transport',         'icon': '🚗',  'color': '#45B7D1'},
        {'id': 4,  'name': 'Rent and Housing',  'icon': '🏠',  'color': '#96CEB4'},
        {'id': 5,  'name': 'Utilities',         'icon': '💡',  'color': '#FFEAA7'},
        {'id': 6,  'name': 'Shopping',          'icon': '🛍️', 'color': '#DDA0DD'},
        {'id': 7,  'name': 'Healthcare',        'icon': '🏥',  'color': '#98D8C8'},
        {'id': 8,  'name': 'Education',         'icon': '📚',  'color': '#7EC8E3'},
        {'id': 9,  'name': 'Entertainment',     'icon': '🎬',  'color': '#FFB347'},
        {'id': 10, 'name': 'Travel',            'icon': '✈️',  'color': '#87CEEB'},
        {'id': 11, 'name': 'Insurance',         'icon': '🛡️', 'color': '#B0C4DE'},
        {'id': 12, 'name': 'Investments',       'icon': '📈',  'color': '#90EE90'},
        {'id': 13, 'name': 'Loan and EMI',      'icon': '🏦',  'color': '#F4A460'},
        {'id': 14, 'name': 'Subscriptions',     'icon': '📱',  'color': '#DA70D6'},
        {'id': 15, 'name': 'Personal Care',     'icon': '💆',  'color': '#FFB6C1'},
        {'id': 16, 'name': 'Family Expenses',   'icon': '👨‍👩‍👧', 'color': '#98FB98'},
        {'id': 17, 'name': 'Other',             'icon': '📦',  'color': '#D3D3D3'},
    ]
    for cat in categories:
        Category.objects.update_or_create(id=cat['id'], defaults=cat)

def remove_categories(apps, schema_editor):
    Category = apps.get_model('expenses', 'Category')
    Category.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('expenses', '0004_expense_custom_category_alter_expense_category'),
    ]

    operations = [
        migrations.RunPython(seed_categories, reverse_code=remove_categories),
    ]
