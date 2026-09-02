import streamlit as st
import pandas as pd
import joblib


# ============================================================
# PAGE CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="NYC Airbnb Room Type Oracle",
    page_icon="🏙️",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============================================================
# CUSTOM CSS
# ============================================================

st.markdown("""
<style>

    /* Main background */
    .stApp {
        background: #07080b;
        color: #e9ecf3;
    }

    /* Hide Streamlit default menu */
    #MainMenu {
        visibility: hidden;
    }

    footer {
        visibility: hidden;
    }

    /* Main title */
    .main-title {
        font-size: 55px;
        font-weight: 800;
        color: #00e6ff;
        margin-bottom: 0;
    }

    .subtitle {
        font-size: 18px;
        color: #9aa3b7;
        margin-top: 5px;
        margin-bottom: 30px;
    }

    /* Cards */
    .card {
        background: #12151d;
        border: 1px solid #2c3348;
        border-radius: 18px;
        padding: 25px;
        margin-bottom: 20px;
    }

    /* Prediction card */
    .prediction-card {
        background: linear-gradient(
            135deg,
            rgba(0,230,255,0.12),
            rgba(255,46,166,0.08)
        );

        border: 1px solid rgba(0,230,255,0.35);
        border-radius: 18px;
        padding: 30px;
        text-align: center;
    }

    .prediction-label {
        color: #9aa3b7;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .prediction-value {
        font-size: 40px;
        font-weight: 800;
        color: #ffd23a;
        margin-top: 10px;
    }

    .confidence {
        font-size: 28px;
        color: #00e6ff;
        font-weight: bold;
    }

    /* Section heading */
    .section-title {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        margin-top: 10px;
        margin-bottom: 15px;
    }

    /* Metric cards */
    .metric-card {
        background: #0c0e14;
        border: 1px solid #22283a;
        border-radius: 14px;
        padding: 18px;
        text-align: center;
    }

    .metric-number {
        font-size: 30px;
        font-weight: bold;
        color: #ffd23a;
    }

    .metric-label {
        color: #9aa3b7;
        font-size: 13px;
    }

    /* Button */
    .stButton > button {
        width: 100%;
        background: #ffd23a;
        color: #111111;
        font-weight: bold;
        border-radius: 10px;
        border: none;
        padding: 12px;
    }

    .stButton > button:hover {
        background: #ffb800;
        color: #000000;
    }

    /* Info */
    .info-box {
        background: rgba(0,230,255,0.07);
        border-left: 4px solid #00e6ff;
        padding: 15px;
        border-radius: 8px;
        color: #cbd2df;
    }

</style>
""", unsafe_allow_html=True)


# ============================================================
# LOAD MODEL
# ============================================================

@st.cache_resource
def load_model():

    try:

        model = joblib.load("Model_Pipeline.pkl")

        return model, None

    except Exception as e:

        return None, str(e)


model, model_error = load_model()


# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:

    st.markdown(
        "<h2>🏙️ NYC Oracle</h2>",
        unsafe_allow_html=True
    )

    st.markdown("---")

    st.markdown("### 🤖 Model Status")

    if model is not None:

        st.success("Model loaded successfully")

    else:

        st.error("Model could not be loaded")

        st.code(model_error)

    st.markdown("---")

    st.markdown("### 📊 Project")

    st.write(
        """
        **NYC Airbnb Room Type Classification**

        Machine Learning classification project that predicts
        the room type of an Airbnb listing using listing,
        location and availability features.
        """
    )

    st.markdown("---")

    st.markdown("### 🧠 Model")

    st.write("Random Forest Classifier")

    st.markdown("---")

    st.caption(
        "Built with Python • Scikit-learn • Streamlit"
    )


# ============================================================
# HEADER
# ============================================================

st.markdown(
    '<p class="main-title">NYC Airbnb Oracle</p>',
    unsafe_allow_html=True
)

st.markdown(
    '<p class="subtitle">'
    'Predict the room type of an NYC Airbnb listing using your trained ML pipeline.'
    '</p>',
    unsafe_allow_html=True
)


# ============================================================
# PROJECT METRICS
# ============================================================

col1, col2, col3, col4 = st.columns(4)

with col1:

    st.markdown("""
    <div class="metric-card">
        <div class="metric-number">10</div>
        <div class="metric-label">Input Features</div>
    </div>
    """, unsafe_allow_html=True)


with col2:

    st.markdown("""
    <div class="metric-card">
        <div class="metric-number">5</div>
        <div class="metric-label">NYC Boroughs</div>
    </div>
    """, unsafe_allow_html=True)


with col3:

    st.markdown("""
    <div class="metric-card">
        <div class="metric-number">4</div>
        <div class="metric-label">Room Classes</div>
    </div>
    """, unsafe_allow_html=True)


with col4:

    st.markdown("""
    <div class="metric-card">
        <div class="metric-number">RF</div>
        <div class="metric-label">ML Model</div>
    </div>
    """, unsafe_allow_html=True)


st.markdown("<br>", unsafe_allow_html=True)


# ============================================================
# INPUT SECTION
# ============================================================

st.markdown(
    '<div class="section-title">📍 Listing Information</div>',
    unsafe_allow_html=True
)

left, right = st.columns(2)


# ============================================================
# LOCATION
# ============================================================

with left:

    st.markdown("### 📍 Location")

    latitude = st.number_input(
        "Latitude",
        min_value=-90.0,
        max_value=90.0,
        value=40.7128,
        step=0.0001,
        format="%.6f"
    )

    longitude = st.number_input(
        "Longitude",
        min_value=-180.0,
        max_value=180.0,
        value=-74.0060,
        step=0.0001,
        format="%.6f"
    )

    neighbourhood_group = st.selectbox(
        "Borough / Neighbourhood Group",
        [
            "Manhattan",
            "Brooklyn",
            "Queens",
            "Bronx",
            "Staten Island"
        ]
    )

    neighbourhood = st.text_input(
        "Neighbourhood",
        value="Midtown",
        placeholder="e.g. Williamsburg"
    )


# ============================================================
# LISTING FEATURES
# ============================================================

with right:

    st.markdown("### 🏠 Listing Features")

    price = st.slider(
        "Price per night ($)",
        min_value=10,
        max_value=1000,
        value=150,
        step=1
    )

    minimum_nights = st.slider(
        "Minimum nights",
        min_value=1,
        max_value=365,
        value=3,
        step=1
    )

    number_of_reviews = st.slider(
        "Number of reviews",
        min_value=0,
        max_value=600,
        value=24,
        step=1
    )

    reviews_per_month = st.slider(
        "Reviews per month",
        min_value=0.0,
        max_value=30.0,
        value=1.2,
        step=0.1
    )

    calculated_host_listings_count = st.slider(
        "Host listings count",
        min_value=0,
        max_value=500,
        value=1,
        step=1
    )

    availability_365 = st.slider(
        "Availability / 365 days",
        min_value=0,
        max_value=365,
        value=180,
        step=1
    )


# ============================================================
# INPUT SUMMARY
# ============================================================

st.markdown("---")

st.markdown(
    '<div class="section-title">📋 Input Summary</div>',
    unsafe_allow_html=True
)

input_data = pd.DataFrame({
    "Feature": [
        "Latitude",
        "Longitude",
        "Price",
        "Minimum Nights",
        "Number of Reviews",
        "Reviews / Month",
        "Host Listings Count",
        "Availability / 365",
        "Borough",
        "Neighbourhood"
    ],

    "Value": [
        latitude,
        longitude,
        f"${price}",
        minimum_nights,
        number_of_reviews,
        reviews_per_month,
        calculated_host_listings_count,
        availability_365,
        neighbourhood_group,
        neighbourhood
    ]
})

st.dataframe(
    input_data,
    use_container_width=True,
    hide_index=True
)


# ============================================================
# PREDICT BUTTON
# ============================================================

st.markdown("---")

predict_button = st.button(
    "🚀 CLASSIFY AIRBNB LISTING"
)


# ============================================================
# PREDICTION
# ============================================================

if predict_button:

    if model is None:

        st.error(
            "Model could not be loaded. "
            "Make sure Model_Pipeline.pkl is in the same folder as app.py."
        )

        st.stop()


    if not neighbourhood.strip():

        st.warning(
            "Please enter a neighbourhood."
        )

        st.stop()


    # --------------------------------------------------------
    # Create dataframe
    # --------------------------------------------------------

    input_df = pd.DataFrame({

        "latitude": [latitude],

        "longitude": [longitude],

        "price": [price],

        "minimum_nights": [minimum_nights],

        "number_of_reviews": [number_of_reviews],

        "reviews_per_month": [reviews_per_month],

        "calculated_host_listings_count": [
            calculated_host_listings_count
        ],

        "availability_365": [availability_365],

        "neighbourhood_group": [
            neighbourhood_group
        ],

        "neighbourhood": [
            neighbourhood
        ]

    })


    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    try:

        prediction = model.predict(input_df)

        predicted_room_type = prediction[0]


        # ----------------------------------------------------
        # Probability
        # ----------------------------------------------------

        if hasattr(model, "predict_proba"):

            probabilities = model.predict_proba(
                input_df
            )[0]

            if hasattr(model, "classes_"):

                classes = model.classes_

            else:

                classes = [
                    "Entire home/apt",
                    "Private room",
                    "Shared room",
                    "Hotel room"
                ]

        else:

            classes = [predicted_room_type]

            probabilities = [1.0]


        # ----------------------------------------------------
        # Confidence
        # ----------------------------------------------------

        confidence = max(probabilities)


        # ====================================================
        # RESULT
        # ====================================================

        st.markdown("---")

        st.markdown(
            '<div class="section-title">🎯 Prediction Result</div>',
            unsafe_allow_html=True
        )


        result_col1, result_col2 = st.columns(2)


        # ----------------------------------------------------
        # Prediction Card
        # ----------------------------------------------------

        with result_col1:

            st.markdown(
                f"""
                <div class="prediction-card">

                    <div class="prediction-label">
                        Predicted Room Type
                    </div>

                    <div class="prediction-value">
                        {predicted_room_type}
                    </div>

                    <br>

                    <div class="prediction-label">
                        Model Confidence
                    </div>

                    <div class="confidence">
                        {confidence * 100:.2f}%
                    </div>

                </div>
                """,
                unsafe_allow_html=True
            )


        # ----------------------------------------------------
        # Probability Chart
        # ----------------------------------------------------

        with result_col2:

            st.markdown(
                "### 📊 Prediction Probability"
            )

            probability_df = pd.DataFrame({

                "Room Type": classes,

                "Probability": probabilities

            })

            probability_df["Probability (%)"] = (
                probability_df["Probability"] * 100
            )

            probability_df = (
                probability_df
                .sort_values(
                    "Probability (%)",
                    ascending=False
                )
                .reset_index(drop=True)
            )


            st.bar_chart(
                probability_df.set_index(
                    "Room Type"
                )["Probability (%)"]
            )


        # ====================================================
        # PROBABILITY TABLE
        # ====================================================

        st.markdown("### 🔍 Class Probabilities")

        display_df = probability_df[
            ["Room Type", "Probability (%)"]
        ].copy()

        display_df["Probability (%)"] = (
            display_df["Probability (%)"]
            .round(2)
        )

        st.dataframe(
            display_df,
            use_container_width=True,
            hide_index=True
        )


        # ====================================================
        # SUCCESS MESSAGE
        # ====================================================

        st.success(
            f"The model predicts **{predicted_room_type}** "
            f"with **{confidence * 100:.2f}% confidence**."
        )


    except Exception as e:

        st.error(
            "Prediction failed."
        )

        st.exception(e)


# ============================================================
# HOW IT WORKS
# ============================================================

st.markdown("---")

st.markdown(
    '<div class="section-title">⚙️ How It Works</div>',
    unsafe_allow_html=True
)

step1, step2, step3 = st.columns(3)


with step1:

    st.markdown("""
    <div class="card">

    ### 01 — Input

    Enter the Airbnb listing information such as:

    - Location
    - Price
    - Reviews
    - Minimum nights
    - Availability
    - Neighbourhood

    </div>
    """, unsafe_allow_html=True)


with step2:

    st.markdown("""
    <div class="card">

    ### 02 — ML Pipeline

    Your saved Scikit-learn pipeline performs:

    - Data preprocessing
    - Categorical encoding
    - Feature transformation
    - Random Forest classification

    </div>
    """, unsafe_allow_html=True)


with step3:

    st.markdown("""
    <div class="card">

    ### 03 — Prediction

    The trained model returns:

    - Predicted room type
    - Class probabilities
    - Prediction confidence

    </div>
    """, unsafe_allow_html=True)


# ============================================================
# FOOTER
# ============================================================

st.markdown("---")

st.markdown(
    """
    <center>
        <p style="color:#5b6377;">
            NYC Airbnb Room Type Classification
            • Machine Learning Project
            • Streamlit
        </p>
    </center>
    """,
    unsafe_allow_html=True
)