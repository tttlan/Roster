# Common directives without unit test coverage

Todo but very hard to write tests for:

whenScrolled (hard to unit test scroll)
autoFill
back (hard to unit test page navigation)
disableToggle
ngEnter (not sure how to test scope.apply)
onContainerBlur (not sure how to test scope.apply)

Don't think we should unit test these:

reload (very basic)
error (very basic)
setMinHeight / getMedia.... something funny going on here
onlineStatus (not using this)
menuArrow (will be removing this soon, no point writing test)
menuArrowChild (will be removing this soon, no point writing test)
stickyHead (better tested with visual tests / manual click around)