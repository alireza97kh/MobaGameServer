// Abilities routes
app.get('/abilities', async (req, res) => {
    const abilities = await Ability.find();
    res.send(abilities);
  });
  
  app.get('/abilities/:id', async (req, res) => {
    const ability = await Ability.findById(req.params.id);
    if (!ability) return res.status(404).send('Ability not found.');
    res.send(ability);
  });
  
  app.post('/abilities', async (req, res) => {
    const ability = new Ability({
      name: req.body.name,
      description: req.body.description,
      damage: req.body.damage,
      cooldown: req.body.cooldown,
      effects: req.body.effects,
    });
    await ability.save();
    res.send(ability);
  });
  
  // Teams routes
  app.get('/teams', async (req, res) => {
    const teams = await Team.find().populate('players', 'name');
    res.send(teams);
  });
  
  app.get('/teams/:id', async (req, res) => {
    const team = await Team.findById(req.params.id).populate('players', 'name');
    if (!team) return res.status(404).send('Team not found.');
    res.send(team);
  });
  
  app.post('/teams', async (req, res) => {
    const team = new Team({
      name: req.body.name,
      players: req.body.players,
    });
    await team.save();
    res.send(team);
  });
  
  // Leagues routes
  app.get('/leagues', async (req, res) => {
    const leagues = await League.find();
    res.send(leagues);
  });
  
  app.get('/leagues/:id', async (req, res) => {
    const league = await League.findById(req.params.id);
    if (!league) return res.status(404).send('League not found.');
    res.send(league);
  });
  
  app.post('/leagues', async (req, res) => {
    const league = new League({
      name: req.body.name,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
    });
    await league.save();
    res.send(league);
  });

// Protected route

  app.get('/protected', async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, 'secretkey');
  
      res.json({ message: `Hello, ${decoded.username}! Your friends are: ${decoded.friends}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
    
  
  



  //get All Users
app.get('/geteAllUsers', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({users: users});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

