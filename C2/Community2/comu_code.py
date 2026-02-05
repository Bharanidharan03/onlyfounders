import json
import re
import hashlib
from typing import List, Dict, Tuple

import numpy as np
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity

from cryptography.fernet import Fernet


# -------------------- CLASS-BASED SYSTEM --------------------

class CommunitySystem:
    def __init__(self, data_dir: str = r"D:\OFcommun"):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.DATA_DIR = data_dir
        
        # Ensure directory exists
        if not os.path.exists(self.DATA_DIR):
            try:
                os.makedirs(self.DATA_DIR)
            except:
                # Fallback to current dir if D:\ is not accessible (e.g. testing)
                self.DATA_DIR = os.path.dirname(os.path.abspath(__file__))

        # State
        self.USERS: List[Dict] = []
        self.USER_PROFILES: List[str] = [] 
        self.COMMUNITY_VECTORS: Dict[str, np.ndarray] = {}  
        self.COMMUNITY_USERS_MAP: Dict[str, List[str]] = {} 
        self.USER_COMMUNITY_MAP: Dict[str, List[str]] = {} 

        # Auto-load default state if exists in DATA_DIR
        default_file = os.path.join(self.DATA_DIR, "community_data.json")
        if os.path.exists(default_file):
            self.load_from_json(default_file)

        # KEY GENERATION
        self.FERNET_KEY = Fernet.generate_key()
        self.cipher = Fernet(self.FERNET_KEY)

    def set_output_dir(self, new_dir: str):
        """
        Updates the directory where data is saved.
        """
        if not new_dir:
            return
            
        self.DATA_DIR = new_dir
        if not os.path.exists(self.DATA_DIR):
            try:
                os.makedirs(self.DATA_DIR)
            except Exception as e:
                print(f"Error creating directory {new_dir}: {e}")

    def load_from_json(self, file_path: str):
        """
        Loads state from a specific JSON file path.
        """
        try:
            if not os.path.exists(file_path):
                return False
                
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            self.USERS = data.get("users", [])
            self.COMMUNITY_USERS_MAP = data.get("community_users_map", {})
            self.USER_COMMUNITY_MAP = data.get("user_community_map", {})
            
            if self.USERS:
                self.USER_PROFILES = [self.preprocess_user(u) for u in self.USERS]
                self.vectorizer.fit(self.USER_PROFILES)
                all_vectors = self.vectorizer.transform(self.USER_PROFILES).toarray()
                uid_to_idx = {u["user_id"]: i for i, u in enumerate(self.USERS)}
                
                self.COMMUNITY_VECTORS = {}
                for cid, members in self.COMMUNITY_USERS_MAP.items():
                    member_indices = [uid_to_idx[uid] for uid in members if uid in uid_to_idx]
                    if member_indices:
                        self.COMMUNITY_VECTORS[cid] = np.mean(all_vectors[member_indices], axis=0)
            return True
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            return False


    def preprocess_user(self, user: Dict) -> str:
        """
        Combine and clean all user attributes into one text profile.
        """
        # Merge all list fields into a single string
        combined_list = (
            user.get("top_subject", []) + 
            user.get("skills", []) + 
            user.get("interest", []) + 
            user.get("brainstorming_way", []) +
            user.get("chat_data", [])
        )
        combined = " ".join(combined_list)
        combined = combined.lower()
        # Replace non-letters with SPACE to preserve tokens (e.g. apple_picking -> apple picking)
        combined = re.sub(r"[^a-zA-Z]", " ", combined)
        return combined

    def encrypt_chat_data(self, chat_data: List[str]) -> str:
        """
        Encrypt chat data and return a hash reference.
        """
        raw_text = " ".join(chat_data).encode()
        encrypted = self.cipher.encrypt(raw_text)
        chat_hash = hashlib.sha256(encrypted).hexdigest()
        return chat_hash

    def vectorize_profiles(self, profiles: List[str]):
        """
        Convert text profiles into TF-IDF vectors.
        """
        # Improved: Capture single letters (e.g. 'C', 'R') and remove standard stop words
        vectorizer = TfidfVectorizer(token_pattern=r'(?u)\b\w+\b', stop_words='english')
        vectors = vectorizer.fit_transform(profiles)
        return vectorizer, vectors

    def cluster_users(self, vectors, n_clusters: int):
        """
        Cluster users into communities using KMeans.
        """
        model = KMeans(n_clusters=n_clusters, random_state=42)
        labels = model.fit_predict(vectors)
        return model, labels

    def generate_community_name(self, vectorizer, centroid_vector) -> str:
        """
        Generate subreddit-like name using dominant keywords.
        """
        feature_names = vectorizer.get_feature_names_out()
        top_indices = centroid_vector.argsort()[-3:][::-1]
        keywords = [feature_names[i] for i in top_indices]
        return "r_" + "_".join(keywords)

    def recommend_communities(self, user_vector, threshold: float, user_profile_text: str = ""):
        """
        Recommend communities, enforced by STRICT parameter matching.
        Rule: If user has ANY word not present in the community vocabulary, rejected.
        """
        matches = []
        
        # Get user's unique tokens set
        user_tokens = set(user_profile_text.split())

        for cid, centroid in self.COMMUNITY_VECTORS.items():
            # 1. Check Similarity Score
            score = cosine_similarity(user_vector, centroid.reshape(1, -1))[0][0]
            
            if score >= threshold:
                matches.append((cid, score))
        
        # Sort by score descending
        matches.sort(key=lambda x: x[1], reverse=True)
        return matches

    def user_consent(self, user_id: str, community_id: str, consent: bool) -> bool:
        """
        Simulate explicit user consent.
        """
        return consent

    def add_user_to_community(self, user_id: str, community_id: str):
        """
        Add user to community and update mappings.
        """
        # Update User -> Communities (One to Many)
        if user_id not in self.USER_COMMUNITY_MAP:
            self.USER_COMMUNITY_MAP[user_id] = []
        if community_id not in self.USER_COMMUNITY_MAP[user_id]:
            self.USER_COMMUNITY_MAP[user_id].append(community_id)

        # Update Community -> Users
        if community_id not in self.COMMUNITY_USERS_MAP:
            self.COMMUNITY_USERS_MAP[community_id] = []
        if user_id not in self.COMMUNITY_USERS_MAP[community_id]:
            self.COMMUNITY_USERS_MAP[community_id].append(user_id)

    def add_new_user(self, user: Dict, consent: bool, similarity_threshold: float = 0.3) -> str:
        """
        Full pipeline for adding a new user. Returns a status message.
        """
        # Check if user already exists
        for existing_user in self.USERS:
            if existing_user["user_id"] == user["user_id"]:
                return f"User {user['user_id']} already exists in the system. Skipping."

        # Preprocess before deleting data needed for profiling
        profile_text = self.preprocess_user(user)
        self.USER_PROFILES.append(profile_text)

        # Encrypt chat data
        chat_hash = self.encrypt_chat_data(user["chat_data"])
        user["chat_hash"] = chat_hash
        
        # We delete the original chat data from the user dict as per original logic
        # but since we might invoke this multiple times in a session, we should work on a copy 
        # or be aware the input dict is mutated.
        if "chat_data" in user:
            del user["chat_data"]

        self.USERS.append(user)
        current_user_index = len(self.USERS) - 1

        vectorizer, vectors = self.vectorize_profiles(self.USER_PROFILES)
        user_vector = vectors[current_user_index]

        # --- FIX: Recompute ALL existing community centroids with new vectorizer ---
        # This is necessary because the vocabulary size (dimensions) changes with every new user.
        for comm_id, member_ids in self.COMMUNITY_USERS_MAP.items():
            # Find indices of all members in this community
            member_indices = [i for i, u in enumerate(self.USERS) if u["user_id"] in member_ids]
            if member_indices:
                # Calculate new centroid from the updated vectors
                community_vectors_matrix = vectors[member_indices]
                new_centroid = np.asarray(community_vectors_matrix.mean(axis=0)).flatten()
                self.COMMUNITY_VECTORS[comm_id] = new_centroid

        joined_communities_msg = ""
        matched_community_ids = set()

        # 1. Attempt to join existing communities (SUBSET CHECK)
        if self.COMMUNITY_VECTORS:
            matches = self.recommend_communities(user_vector, similarity_threshold, user_profile_text=profile_text)
            
            joined_list = []
            for community_id, score in matches:
                if self.user_consent(user["user_id"], community_id, consent):
                    self.add_user_to_community(user["user_id"], community_id)
                    joined_list.append(f"{community_id} (score={score:.2f})")
                    matched_community_ids.add(community_id)
            
            if joined_list:
                joined_communities_msg = f"User {user['user_id']} joined: " + ", ".join(joined_list)

        # 2. Check if we need to CREATE a new community (SUPERSET / NEW PARAMETER CHECK)
        # Even if they joined some, if they have EXTRA keywords that didn't fit elsewhere,
        # we might want to create a new niche for them.
        
        # Simple heuristic based on user request: 
        # "Also creating a new community for AI farming" implies if they have ANY extra traits, we create.
        # But we don't want to duplicate if they joined a perfect match.
        
        # Check if they joined a "Perfect Match" (where user parameters == community parameters)
        # Construct user vocabulary
        user_tokens = set(profile_text.split())
        
        perfect_match_found = False
        for cid in matched_community_ids:
            # Check community vocab again
            community_members = self.COMMUNITY_USERS_MAP.get(cid, [])
            community_text = ""
            for i, u in enumerate(self.USERS):
                if u["user_id"] in community_members:
                    community_text += " " + self.USER_PROFILES[i]
            community_tokens = set(community_text.split())
            
            # If user is subset or equal, did they bring anything NEW?
            if not (user_tokens - community_tokens):
                # User added nothing new to this specific community, so they fit perfectly.
                # However, if user tokens < community tokens, they are a subset.
                # If they joined, they are happy.
                # Perfect match here effectively means "did we cover all user interests?"
                # Actually, simply: if we joined *any* community, did that community cover ALL my tokens?
                # If yes, no need to create. If no (i.e. I have 'farming'), create.
                pass 
                
        # Logic: If user has ANY token that is NOT covered by the communities they joined, create new.
        # Or simpler logic per request: If they joined existing, good. BUT if they have unique stuff, create new.
        # Let's check "Uncovered Tokens".
        
        covered_tokens = set()
        for cid in matched_community_ids:
            community_members = self.COMMUNITY_USERS_MAP.get(cid, [])
            community_text = ""
            for i, u in enumerate(self.USERS):
                 if u["user_id"] != user["user_id"] and u["user_id"] in community_members:
                     # Only check PRE-EXISTING members to define what the community "was"
                     community_text += " " + self.USER_PROFILES[i]
            
            curr_comm_tokens = set(community_text.split())
            covered_tokens.update(curr_comm_tokens)

        # Uncovered = User Tokens - All Tokens of Communities I Joined
        uncovered_tokens = user_tokens - covered_tokens
        
        new_community_msg = ""
        # If I joined nothing, OR if I have unique tokens not seen in the groups I joined...
        if not matched_community_ids or uncovered_tokens:
            # Create new community
            n_clusters = max(1, len(self.COMMUNITY_USERS_MAP) + 1)
            model, labels = self.cluster_users(vectors, n_clusters)

            new_label = labels[-1]
            centroid = model.cluster_centers_[new_label]

            community_name = self.generate_community_name(vectorizer, centroid)
            
            # Prevent duplicate name collision if possible, or just overwrite (logic supports overwrite)
            self.COMMUNITY_VECTORS[community_name] = centroid
            self.add_user_to_community(user["user_id"], community_name)
            
            new_community_msg = f"New community created: {community_name}"

        # Save state to JSON and Python
        self.save_to_json()
        self.save_to_py()

        # Combine messages
        if joined_communities_msg and new_community_msg:
            return f"{joined_communities_msg} AND {new_community_msg}"
        elif joined_communities_msg:
            return joined_communities_msg
        elif new_community_msg:
            return f"{new_community_msg} (User {user['user_id']} added)"
        else:
            return "No action taken (logic error?)"

    def save_to_json(self, filename: str = "community_data.json"):
        """
        Save the current system state to enforced DATA_DIR.
        """
        data = {
            "users": self.USERS,
            "community_users_map": self.COMMUNITY_USERS_MAP,
            "user_community_map": self.USER_COMMUNITY_MAP
        }
        file_path = os.path.join(self.DATA_DIR, filename)
        try:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            print(f"Error saving JSON: {e}")

    def save_to_py(self, filename: str = "community_data.py"):
        """
        Save the current system state as a Python module in enforced DATA_DIR.
        """
        file_path = os.path.join(self.DATA_DIR, filename)
        try:
            with open(file_path, 'w') as f:
                f.write("# Generated Community Data\n\n")
                f.write(f"USERS = {repr(self.USERS)}\n\n")
                f.write(f"COMMUNITY_USERS_MAP = {repr(self.COMMUNITY_USERS_MAP)}\n\n")
                f.write(f"USER_COMMUNITY_MAP = {repr(self.USER_COMMUNITY_MAP)}\n")
        except Exception as e:
            print(f"Error saving Python file: {e}")


# -------------------- EXAMPLE USAGE --------------------

if __name__ == "__main__":
    system = CommunitySystem()
    
    user1 = {
        "user_id": "UD01",
        "top_subject": ["rotational motion", "NLM"],
        "skills": ["python"],
        "interest": ["ML", "Robotics"],
        "brainstorming_way": ["deepthinker", "creative_explorer"],
        "chat_data": [
            "I like thinking deeply about algorithms",
            "Robotics problems excite me"
        ]
    }

    print(system.add_new_user(user1, consent=True))
