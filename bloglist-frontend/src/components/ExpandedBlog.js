import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

const ExpandedBlog = ({ blogs, user, likeBlog, deleteBlog }) => {
	const id = useParams().id
	if (!blogs || !id) return null
	const blog = blogs.find((n) => n.id === id)
	return (
		<div>
			<h2>Blog: {blog.title}</h2>
			<a href={blog.url}>{blog.url}</a>
			<div>
				{blog.likes} likes <button onClick={() => likeBlog(blog.id)}>like</button>
			</div>
			<div>Added by {blog.author}</div>
			{user.id === blog.user.id && <button onClick={() => deleteBlog(blog)}>delete</button>}
		</div>
	)
}

export default ExpandedBlog
