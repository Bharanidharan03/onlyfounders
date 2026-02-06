import streamlit as st
import sys
import os

# Ensure we can import comu_code
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from comu_code import CommunitySystem

st.set_page_config(page_title="Community Recommender", page_icon="🤝", layout="wide")

# Custom CSS for a better look
st.markdown("""
<style>
    .stButton>button {
        width: 100%;
        background-color: #4CAF50; 
        color: white;
        border-radius: 8px;
    }
    .stTextInput>div>div>input {
        border-radius: 6px;
    }
    .main-header {
        font-size: 2.5rem;
        color: #2c3e50;
        text-align: center;
        margin-bottom: 2rem;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-header">AI Community Recommender 🤝</div>', unsafe_allow_html=True)

# Initialize System in Session State
if 'system' not in st.session_state:
    st.session_state.system = CommunitySystem()
    # Add a demo user initially so the system isn't empty execution
    demo_user = {
        "user_id": "DEMO_01",
        "top_subject": ["physics", "mechanics"],
        "skills": ["math", "calculus"],
        "interest": ["science", "engineering"],
        "brainstorming_way": ["analytical", "structured"],
        "chat_data": ["I love solving physics problems", "Mechanics is fascinating"]
    }
    st.session_state.system.add_new_user(demo_user, consent=True)

# Layout
col1, col2 = st.columns([1, 1], gap="large")

with col1:
    st.subheader("📝 New User Profile")
    
    with st.form("user_form"):
        user_id = st.text_input("User ID", value="UD02", placeholder="e.g., UD02")
        
        top_subjects = st.text_input("Top Subjects", 
            placeholder="e.g., rotational motion, NLM")
            
        skills = st.text_input("Skills", 
            placeholder="e.g., python, data analysis")
            
        interests = st.text_input("Interests", 
            placeholder="e.g., ML, Robotics")
            
        brainstorming = st.text_input("Brainstorming Style", 
            placeholder="e.g., deepthinker, creative_explorer")
            
        chat_data_input = st.text_area("Chat History / Thoughts", 
            placeholder="Enter some chat messages or thoughts, separated by newlines...",
            height=150)
            
        st.markdown("---")
        sim_threshold = st.slider("Similarity Threshold (Higher = Stricter)", 
                                  min_value=0.1, max_value=1.0, value=0.4, step=0.05,
                                  help="Controls matching strictness. NOTE: Users must also strictly match existing community parameters. Partial matches with new keywords will spawn NEW communities.")

        submitted = st.form_submit_button("Find or Create Community")

with col2:
    st.subheader("🔍 Results & System Status")
    
    if submitted:
        if not user_id:
            st.error("Please enter a User ID.")
        else:
            # Parse inputs
            user_data = {
                "user_id": user_id,
                "top_subject": [s.strip() for s in top_subjects.split(",") if s.strip()],
                "skills": [s.strip() for s in skills.split(",") if s.strip()],
                "interest": [s.strip() for s in interests.split(",") if s.strip()],
                "brainstorming_way": [s.strip() for s in brainstorming.split(",") if s.strip()],
                "chat_data": [line.strip() for line in chat_data_input.split("\n") if line.strip()]
            }

            # Run Logic
            result_message = st.session_state.system.add_new_user(
                user_data, 
                consent=True, 
                similarity_threshold=sim_threshold
            )
            
            # Display Result (Handle "AND" split for dual actions)
            if " AND " in result_message:
                parts = result_message.split(" AND ")
                for part in parts:
                    if "New community created" in part:
                        st.success("🌟 " + part)
                    else:
                        st.info("✅ " + part)
            elif "New community created" in result_message:
                st.success("🌟 " + result_message)
            else:
                st.info("✅ " + result_message)

    # Dashboard view of current state
    st.divider()
    st.markdown("### 📊 Active Communities")
    
    if st.session_state.system.COMMUNITY_VECTORS:
        for comm_name, users in st.session_state.system.COMMUNITY_USERS_MAP.items():
            with st.expander(f"**{comm_name}** ({len(users)} users)", expanded=True):
                st.write(f"Members: {', '.join(users)}")
    else:
        st.write("No communities formed yet.")

    st.divider()
    st.caption(f"Total Users Key: {len(st.session_state.system.USERS)}")

    with st.sidebar:
        st.markdown("### 💾 System Status")
        st.info(f"Saving to: `{st.session_state.system.DATA_DIR}`")
        
        st.divider()
        st.markdown("### 📁 Set Output Directory")
        new_dir = st.text_input("New Directory Path", value=st.session_state.system.DATA_DIR)
        if st.button("Update Path"):
            st.session_state.system.set_output_dir(new_dir)
            st.success(f"Path updated!")
            st.rerun()
        
        st.divider()
        st.markdown("### 📥 Import External Data")
        import_path = st.text_input("JSON File Path", placeholder=r"C:\path\to\file.json")
        if st.button("Import Data"):
            if os.path.exists(import_path):
                success = st.session_state.system.load_from_json(import_path)
                if success:
                    st.success("Data imported and state rebuilt!")
                    st.rerun()
                else:
                    st.error("Failed to parse JSON.")
            else:
                st.error("File not found.")
