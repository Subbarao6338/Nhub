import json

def generate_kusto_query(table: str, fields: list, joins: list = None, filters: list = None):
    # Ported logic from semantico create_business_object_query.py
    query = f"['{table}']"

    if joins:
        for join in joins:
            kind = join.get('type', 'inner')
            query += f"\n| join kind={kind} (['{join['table']}']) on {join['left_col']} == {join['right_col']}"

    if fields:
        query += f"\n| project {', '.join(fields)}"

    if filters:
        for f in filters:
            query += f"\n| where {f['col']} {f['op']} {f['val']}"

    return query
