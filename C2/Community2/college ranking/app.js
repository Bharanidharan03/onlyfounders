const rankings = [
    {
        tn_rank: 1,
        name: "Indian Institute of Technology Madras (IIT Madras)",
        national_rank: 1,
        departments: {
            engineering: ["CSE", "ECE", "EEE", "Mechanical", "Civil", "Chemical", "Aerospace", "Ocean Engineering", "Metallurgy"],
            sciences: ["Physics", "Chemistry", "Mathematics"],
            research: ["PhD in Engineering", "MS by Research", "Post-Doc Programs"],
            humanities: ["Development Studies", "Economics"]
        }
    },
    {
        tn_rank: 2,
        name: "Amrita Vishwa Vidyapeetham",
        national_rank: 17,
        departments: {
            engineering: ["CSE", "ECE", "Civil", "Mechanical", "AI & Robotics"],
            medical: ["MBBS", "BDS", "Allied Health Sciences", "Nursing"],
            management: ["MBA", "Business Analytics"],
            arts_science: ["Visual Communication", "English", "Biotechnology"]
        }
    },
    {
        tn_rank: 3,
        name: "Vellore Institute of Technology (VIT)",
        national_rank: 21,
        departments: {
            engineering: ["CSE", "IT", "Bio-Medical", "Electronics", "ECE", "EEE", "Mechanical"],
            management: ["MBA", "BBA"],
            sciences: ["Mathematics", "Physics", "Chemistry"],
            research: ["PhD in various disciplines"]
        }
    },
    {
        tn_rank: 4,
        name: "S.R.M. Institute of Science and Technology",
        national_rank: 22,
        departments: {
            engineering: ["CSE", "AI & DS", "Cyber Security", "Aerospace", "Automobile", "Civil"],
            medical: ["MBBS", "MD", "BDS", "Physiotherapy"],
            management: ["MBA", "Hotel Management"],
            science_humanities: ["Commerce", "Journalism", "Fashion Design"]
        }
    },
    {
        tn_rank: 5,
        name: "Saveetha Institute of Medical and Technical Sciences",
        national_rank: 23,
        departments: {
            medical: ["MBBS", "Dental", "Pharmacy", "Nursing", "Allied Health"],
            engineering: ["CSE", "ECE", "Bio-Medical"],
            law: ["BA LLB", "BBA LLB"],
            management: ["MBA"]
        }
    },
    {
        tn_rank: 6,
        name: "Anna University",
        national_rank: 29,
        departments: {
            engineering: ["Civil", "Mechanical", "ECE", "EEE", "Textile", "Printing", "Information Technology"],
            sciences: ["Mathematics", "Theoretical Physics", "Geology"],
            management: ["MBA in Operations", "Management Studies"],
            architecture: ["B.Arch", "M.Arch"]
        }
    },
    {
        tn_rank: 7,
        name: "National Institute of Technology Tiruchirappalli (NIT Trichy)",
        national_rank: 30,
        departments: {
            engineering: ["CSE", "ECE", "EEE", "Production", "Metallurgy", "Chemical", "Instrumentation"],
            architecture: ["B.Arch"],
            management: ["MBA"],
            sciences: ["M.Sc Mathematics", "Computer Applications (MCA)"]
        }
    },
    {
        tn_rank: 8,
        name: "Sathyabama Institute of Science and Technology",
        national_rank: 34,
        departments: {
            engineering: ["CSE", "ECE", "Bio-Technology", "Aeronautical"],
            medical: ["Dental", "Nursing"],
            arts_science: ["Commerce", "English", "Physics"],
            research: ["PhD Center for Excellence"]
        }
    },
    {
        tn_rank: 9,
        name: "Kalasalingam Academy of Research and Education",
        national_rank: 37,
        departments: {
            engineering: ["CSE", "IT", "Mechanical", "Civil"],
            arts_science: ["Commerce", "BCA", "B.Sc Agriculture"],
            management: ["MBA"]
        }
    },
    {
        tn_rank: 10,
        name: "Shanmugha Arts Science Technology & Research Academy (SASTRA)",
        national_rank: 40,
        departments: {
            engineering: ["CSE", "ICT", "Bio-Medical", "Mechanical"],
            law: ["integrated Law", "Criminal Law"],
            management: ["MBA", "B.Stat"],
            arts_science: ["English", "Mathematics", "Education"]
        }
    },
    {
        tn_rank: 11,
        name: "Sri Sivasubramaniya Nadar College of Engineering (SSN)",
        national_rank: 41,
        departments: {
            engineering: ["CSE", "IT", "ECE", "EEE", "Mechanical", "Bio-Medical", "Chemical"],
            research: ["PhD in Electrical", "Electronics Research"]
        }
    },
    {
        tn_rank: 12,
        name: "PSG College of Technology",
        national_rank: 44,
        departments: {
            engineering: ["Textile", "Production", "Mechanical", "Electronic & Communication", "Robotics"],
            management: ["MBA"],
            applied_science: ["Applied Mathematics", "Software Systems"]
        }
    },
    {
        tn_rank: 13,
        name: "Tamil Nadu Agricultural University (TNAU)",
        national_rank: 48,
        departments: {
            agriculture: ["Agriculture", "Horticulture", "Forestry", "Sericulture"],
            engineering: ["Agricultural Engineering", "Food Technology"],
            sciences: ["Bio-Tech", "Environmental Sciences"]
        }
    },
    {
        tn_rank: 14,
        name: "Bharathidasan University",
        national_rank: 53,
        departments: {
            arts_science: ["History", "Economics", "Bio-Informatics", "Marine Science"],
            management: ["MBA", "Commerce"],
            it: ["MCA", "Data Science"]
        }
    },
    {
        tn_rank: 15,
        name: "Bharath Institute of Higher Education & Research",
        national_rank: 55,
        departments: {
            engineering: ["CSE", "IT", "Civil", "Mechanical"],
            medical: ["MBBS", "Physiotherapy", "Pharmacy"],
            arts_science: ["BCA", "B.Sc Agricultural Sciences"]
        }
    },
    {
        tn_rank: 16,
        name: "Alagappa University",
        national_rank: 60,
        departments: {
            arts_science: ["Tamil", "English", "Physics", "Oceanography"],
            management: ["MBA", "Corporate Secretaryship"],
            education: ["B.Ed", "Special Education"]
        }
    },
    {
        tn_rank: 17,
        name: "Bharathiar University",
        national_rank: 62,
        departments: {
            arts_science: ["Biotechnology", "Microbiology", "Linguistics", "Psychology"],
            management: ["MBA", "Commerce"],
            it: ["Information Technology", "Computer Applications"]
        }
    },
    {
        tn_rank: 18,
        name: "Madras Christian College (MCC)",
        national_rank: 65,
        departments: {
            arts: ["English", "History", "Political Science", "Philosophy"],
            science: ["Zoology", "Botany", "Physics", "Chemistry"],
            commerce: ["B.Com", "BBA"]
        }
    },
    {
        tn_rank: 19,
        name: "Loyola College",
        national_rank: 68,
        departments: {
            arts: ["Sociology", "Social Work", "Economics", "Visual Communication"],
            science: ["Advanced Zoology", "Plant Biology", "Mathematics"],
            commerce: ["Commerce", "BBA"]
        }
    },
    {
        tn_rank: 20,
        name: "Presidency College, Chennai",
        national_rank: 72,
        departments: {
            arts: ["Tamil", "History", "Political Science"],
            science: ["Mathematics", "Physics", "Chemistry", "Geology"],
            commerce: ["B.Com", "M.Com"]
        }
    }
];

function initDashboard() {
    const tableBody = document.getElementById('rankings-body');
    
    rankings.forEach(item => {
        // Create Main Row
        const row = document.createElement('tr');
        row.className = 'ranking-row';
        row.dataset.rank = item.tn_rank;
        
        row.innerHTML = `
            <td><span class="rank-badge">${item.tn_rank}</span></td>
            <td>
                <div class="college-name">
                    ${item.name}
                    <svg class="chevron" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </div>
            </td>
            <td><strong>#${item.national_rank}</strong></td>
        `;
        
        // Create Details Row
        const detailsRow = document.createElement('tr');
        detailsRow.className = 'details-row';
        detailsRow.id = `details-${item.tn_rank}`;
        
        let deptHtml = '';
        for (const [category, list] of Object.entries(item.departments)) {
            deptHtml += `
                <div class="dept-category">
                    <h4>${category.replace('_', ' ')}</h4>
                    <div class="dept-list">
                        ${list.map(dept => `<span class="dept-tag">${dept}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        detailsRow.innerHTML = `
            <td colspan="3">
                <div class="details-content">
                    <div class="dept-grid">
                        ${deptHtml}
                    </div>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        tableBody.appendChild(detailsRow);
        
        // Click Event
        row.addEventListener('click', () => {
            const isExpanded = row.classList.contains('expanded');
            
            // Close all others
            document.querySelectorAll('.ranking-row').forEach(r => r.classList.remove('expanded'));
            document.querySelectorAll('.details-row').forEach(dr => dr.classList.remove('show'));
            
            if (!isExpanded) {
                row.classList.add('expanded');
                detailsRow.classList.add('show');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initDashboard);
