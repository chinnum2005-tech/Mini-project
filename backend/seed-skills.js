const pool = require('./config/database');

async function seedSkills() {
  try {
    console.log('Seeding skills database...');
    
    // Sample skills data
    const skills = [
      { name: 'JavaScript', category: 'Programming' },
      { name: 'Python', category: 'Programming' },
      { name: 'Java', category: 'Programming' },
      { name: 'C++', category: 'Programming' },
      { name: 'React', category: 'Web Development' },
      { name: 'Vue.js', category: 'Web Development' },
      { name: 'Angular', category: 'Web Development' },
      { name: 'Node.js', category: 'Backend' },
      { name: 'Express', category: 'Backend' },
      { name: 'MongoDB', category: 'Database' },
      { name: 'SQL', category: 'Database' },
      { name: 'PostgreSQL', category: 'Database' },
      { name: 'HTML', category: 'Web Development' },
      { name: 'CSS', category: 'Web Development' },
      { name: 'UI/UX Design', category: 'Design' },
      { name: 'Graphic Design', category: 'Design' },
      { name: 'Photography', category: 'Arts' },
      { name: 'Video Editing', category: 'Arts' },
      { name: 'Music', category: 'Arts' },
      { name: 'Drawing', category: 'Arts' },
      { name: 'Mathematics', category: 'Academics' },
      { name: 'Physics', category: 'Academics' },
      { name: 'Chemistry', category: 'Academics' },
      { name: 'Biology', category: 'Academics' },
      { name: 'English', category: 'Languages' },
      { name: 'Spanish', category: 'Languages' },
      { name: 'French', category: 'Languages' },
      { name: 'German', category: 'Languages' },
      { name: 'Mandarin', category: 'Languages' },
      { name: 'Business', category: 'Professional' },
      { name: 'Marketing', category: 'Professional' },
      { name: 'Finance', category: 'Professional' },
      { name: 'Public Speaking', category: 'Communication' },
      { name: 'Writing', category: 'Communication' },
      { name: 'Cooking', category: 'Life Skills' },
      { name: 'Gardening', category: 'Life Skills' },
      { name: 'Fitness', category: 'Health' },
      { name: 'Yoga', category: 'Health' },
      { name: 'Meditation', category: 'Health' },
      { name: 'Chess', category: 'Games' }
    ];
    
    // Insert skills into database
    for (const skill of skills) {
      try {
        const query = `
          INSERT INTO skills (name, category)
          VALUES ($1, $2)
          ON CONFLICT (name) DO NOTHING
        `;
        await pool.query(query, [skill.name, skill.category]);
        console.log(`Added skill: ${skill.name} (${skill.category})`);
      } catch (error) {
        console.error(`Error adding skill ${skill.name}:`, error);
      }
    }
    
    console.log('Skills seeding completed!');
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error during skills seeding:', error);
  }
}

seedSkills();