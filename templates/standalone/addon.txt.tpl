## APIVersion: <%= api %>
## Title: <%= title %>
<% if (description) { -%>
## Description: <%= description %>
<% } -%>
## Author: <%= author %>
## Version: <%= version %>
## AddOnVersion: <%= addOnVersion %>
<% if (variables) { -%>
## SavedVariables: <%= variables %>
<% } -%>

<%= name %>.lua
