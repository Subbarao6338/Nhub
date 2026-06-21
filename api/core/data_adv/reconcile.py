import pandas as pd

def reconcile_data(df1: pd.DataFrame, df2: pd.DataFrame, key_col: str):
    # Ported logic from reconciliation app
    # Merges two dataframes and identifies mismatches
    merged = pd.merge(df1, df2, on=key_col, how='outer', suffixes=('_src', '_tgt'), indicator=True)

    mismatches = merged[merged['_merge'] != 'both'].to_dict(orient='records')

    # Check for value differences in common rows
    common = merged[merged['_merge'] == 'both']
    value_mismatches = []

    for col in df1.columns:
        if col == key_col: continue
        if f"{col}_src" in common.columns and f"{col}_tgt" in common.columns:
            diff = common[common[f"{col}_src"] != common[f"{col}_tgt"]]
            if not diff.empty:
                for _, row in diff.iterrows():
                    value_mismatches.append({
                        "key": row[key_col],
                        "column": col,
                        "source": row[f"{col}_src"],
                        "target": row[f"{col}_tgt"]
                    })

    return {
        "missing_in_target": len(merged[merged['_merge'] == 'left_only']),
        "missing_in_source": len(merged[merged['_merge'] == 'right_only']),
        "value_mismatches": value_mismatches[:50], # Limit output
        "mismatch_count": len(value_mismatches)
    }
