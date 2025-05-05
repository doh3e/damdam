import opensmile

smile = opensmile.Smile(
    feature_set=opensmile.FeatureSet.emobase,
    feature_level=opensmile.FeatureLevel.Functionals
)

def extract(filepath):
    features = smile.process_file(filepath)
    return features