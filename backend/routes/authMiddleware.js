const checkLoggedIn = (req, res, next) => {
  // Check if user is authenticated or logged in
  if (req.isAuthenticated()) {
    // User is logged in, proceed to the next middleware or route handler
    return next();
  }

  // User is not logged in, redirect to login page
  res.redirect("/login");
};

module.exports = checkLoggedIn;
