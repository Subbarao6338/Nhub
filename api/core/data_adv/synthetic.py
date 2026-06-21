import pandas as pd
from sdv.single_table import GaussianCopulaSynthesizer
from sdv.metadata import SingleTableMetadata

def generate_synthetic_data(df: pd.DataFrame, num_rows: int = 100):
    # Ported logic from DataGenie SDV integration
    metadata = SingleTableMetadata()
    metadata.detect_from_dataframe(data=df)

    synthesizer = GaussianCopulaSynthesizer(metadata)
    synthesizer.fit(df)

    synthetic_data = synthesizer.sample(num_rows=num_rows)
    return synthetic_data
