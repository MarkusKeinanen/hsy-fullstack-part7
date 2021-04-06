import React, { useState, useEffect } from 'react'
import Blog from './components/Blog'
import ExpandedBlog from './components/ExpandedBlog'
import User from './components/User'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Footer from './components/Footer'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import userService from './services/users'
import loginService from './services/login'
import { Switch, Route, Link, useParams, useHistory } from 'react-router-dom'

const App = () => {
	const [blogs, setBlogs] = useState(null)
	const [message, setMessage] = useState('')
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [user, setUser] = useState(null)
	const [users, setUsers] = useState(null)

	const blogFormRef = React.createRef()

	useEffect(() => {
		blogService.getAll().then((initialBlogs) => {
			setBlogs(initialBlogs)
		})
	}, [])

	useEffect(() => {
		userService.getAll().then((users) => {
			setUsers(users)
		})
	}, [])

	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
		if (loggedUserJSON) {
			const user = JSON.parse(loggedUserJSON)
			setUser(user)
			blogService.setToken(user.token)
		}
	}, [])

	const addBlog = async (blogObject) => {
		blogFormRef.current.toggleVisibility()
		const returnedBlog = await blogService.create(blogObject)
		if (returnedBlog.error) {
			setMessage(returnedBlog.error)
			setTimeout(() => {
				setMessage('')
			}, 5000)
			return null
		}
		setBlogs(blogs.concat(returnedBlog))
		setMessage('Successfully added blog')
		setTimeout(() => {
			setMessage('')
		}, 5000)
	}

	const addBlogLike = async (id) => {
		const blog = blogs.find((n) => n.id === id)
		const changedBlog = { ...blog, likes: blog.likes + 1 }

		const returnedBlog = await blogService.update(id, changedBlog)
		if (returnedBlog.error) {
			setMessage(returnedBlog.error)
			setTimeout(() => {
				setMessage('')
			}, 5000)
			return null
		}
		setBlogs(blogs.map((blog) => (blog.id !== id ? blog : returnedBlog)))
		setMessage(`Liked blog "${blog.title}". Current likes: ${returnedBlog.likes}`)
		setTimeout(() => {
			setMessage('')
		}, 5000)
	}

	const deleteBlog = async (deletableBlog) => {
		if (!window.confirm(`Are you sure you want to remove blog "${deletableBlog.title}" by ${deletableBlog.author}?`)) return null
		const id = deletableBlog.id
		const result = await blogService.remove(id)
		if (result.error) {
			setMessage(result.error)
			setTimeout(() => {
				setMessage('')
			}, 5000)
			return null
		}
		setBlogs(blogs.filter((b) => b.id !== id))
		setMessage(`Successfully deleted blog "${deletableBlog.title}".`)
		setTimeout(() => {
			setMessage('')
		}, 5000)
	}

	const handleLogin = async (event) => {
		event.preventDefault()
		try {
			const user = await loginService.login({
				username,
				password
			})

			window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))

			blogService.setToken(user.token)
			setUser(user)
			setUsername('')
			setPassword('')
			setMessage('Successfully logged in')
			setTimeout(() => {
				setMessage('')
			}, 5000)
		} catch (exception) {
			console.log(exception)
			setMessage('wrong credentials')
			setTimeout(() => {
				setMessage('')
			}, 5000)
		}
	}

	const handleLogout = () => {
		window.localStorage.removeItem('loggedBlogappUser')
		setUsername('')
		setPassword('')
		setUser(null)
	}

	const loginForm = () => (
		<LoginForm
			username={username}
			password={password}
			handleUsernameChange={({ target }) => setUsername(target.value)}
			handlePasswordChange={({ target }) => setPassword(target.value)}
			handleSubmit={handleLogin}
		/>
	)

	return (
		<div>
			<Notification message={message} />
			{user == null ? (
				loginForm()
			) : (
				<div>
					<div className='menu'>
						<Link to='/blogs'>Blogs</Link>
						<Link to='/users'>Users</Link>
						<div>{user.username} logged in</div>
						<button onClick={() => handleLogout()}>log out</button>
					</div>
					<h2>Blogs</h2>
					<Switch>
						<Route path='/create'>
							<Togglable buttonLabel='create blog' ref={blogFormRef}>
								<BlogForm createBlog={addBlog} />
							</Togglable>
						</Route>
						<Route path='/users/:id'>
							<User users={users} />
						</Route>
						<Route path='/users'>
							{users && (
								<>
									<h2>Users</h2>
									<table>
										<thead>
											<tr>
												<th>Name</th>
												<th>Blogs created</th>
											</tr>
										</thead>
										<tbody>
											{users.map((user) => {
												return (
													<tr key={user.id}>
														<td>
															<Link to={`/users/${user.id}`}>{user.name}</Link>
														</td>
														<td>{user.blogs.length}</td>
													</tr>
												)
											})}
										</tbody>
									</table>
								</>
							)}
						</Route>
						<Route path='/blogs/:id'>
							<ExpandedBlog blogs={blogs} user={user} likeBlog={addBlogLike} deleteBlog={deleteBlog} />
						</Route>
						<Route path='(|/blogs)'>
							<div>
								{blogs &&
									blogs
										.sort((a, b) => a.likes > b.likes)
										.map((blog, i) => (
											<div key={blog.id} className='listed-blog'>
												<Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
											</div>
										))}
							</div>
						</Route>
					</Switch>
				</div>
			)}
			<Footer />
		</div>
	)
}

export default App
