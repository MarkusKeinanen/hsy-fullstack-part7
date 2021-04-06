import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

const User = ({ users }) => {
	const id = useParams().id
	if (!users) return null
	const user = users.find((n) => n.id === id)
	return (
		<div>
			<h2>User: {user.name}</h2>
			<h3>Added blogs</h3>
			<ul>
				{user.blogs.map((blog) => (
					<li key={blog.id}>{blog.title}</li>
				))}
			</ul>
		</div>
	)
}

export default User
