import { useState, useEffect, useCallback } from 'react'

import {

  Activity, ArrowDownRight, ArrowUpRight, Bell, Blocks,

  ChevronDown, CircleHelp, Command, FlaskConical, Gauge,

  GitBranch, Layers3, Plus, Search, Settings2, ShieldCheck,

  Sparkles, ToggleLeft, Zap, LogOut, LoaderCircle

} from 'lucide-react'

import api, { setAuthToken } from './services/api'

import './App.css'

const navItems = [

  { label: 'Overview', icon: Gauge },

  { label: 'Feature flags', icon: ToggleLeft },

  { label: 'Projects', icon: Blocks },

  { label: 'Environments', icon: Layers3 },

  { label: 'Activity log', icon: Activity },

]

function App() {

  // Authentication

  const [token, setToken] = useState(

    () => localStorage.getItem('flagship_token') || ''

  )

  const [user, setUser] = useState(() => {

    try {

      return JSON.parse(localStorage.getItem('flagship_user') || 'null')

    } catch {

      return null

    }

  })

  const [authMode, setAuthMode] = useState('login')

  const [authName, setAuthName] = useState('')

  const [authEmail, setAuthEmail] = useState('')

  const [authPassword, setAuthPassword] = useState('')

  const [authLoading, setAuthLoading] = useState(false)

  // Dashboard data

  const [projects, setProjects] = useState([])

  const [selectedProject, setSelectedProject] = useState(null)

  const [selectedEnvironment, setSelectedEnvironment] = useState(null)

  const [flags, setFlags] = useState([])

  const [loadingFlags, setLoadingFlags] = useState(false)

  // UI state

  const [activeNav, setActiveNav] = useState(

    () => localStorage.getItem('flagship_active_nav') || 'Overview'

  )

  const [environment, setEnvironment] = useState('All environments')

  const [search, setSearch] = useState('')

  const [showCreate, setShowCreate] = useState(false)

  const [editingFlag, setEditingFlag] = useState(null)

  const [editName, setEditName] = useState('')

  const [editDescription, setEditDescription] = useState('')

  const [editRollout, setEditRollout] = useState('')

  const [savingEdit, setSavingEdit] = useState(false)

  const [creatingFlag, setCreatingFlag] = useState(false)

  const [flagEnvironmentId, setFlagEnvironmentId] = useState('')

  const [newName, setNewName] = useState('')

  const [newDescription, setNewDescription] = useState('')

  const [projectName, setProjectName] = useState('')

  const [showCreateProject, setShowCreateProject] = useState(false)

  const [creatingProject, setCreatingProject] = useState(false)

  const [authError, setAuthError] = useState('')

  const [apiError, setApiError] = useState('')

  const [notice, setNotice] = useState('')

  const [busyFlag, setBusyFlag] = useState(null)

  const environments = selectedProject?.environments || []

  function openCreateFlag() {

    const filteredEnvironment = environments.find(

      (item) => item.name.toLowerCase() === environment.toLowerCase()

    )

    const defaultEnvironment =

      filteredEnvironment ||

      selectedEnvironment ||

      environments.find((item) => item.name === 'development') ||

      environments[0]

    setFlagEnvironmentId(defaultEnvironment?._id || '')

    setApiError('')

    setShowCreate(true)

  }

  function openEditFlag(flag) {
    setEditingFlag(flag)
    setEditName(flag.name)
    setEditDescription(flag.description || '')
    setEditRollout(String(flag.rolloutPercentage ?? flag.rollout ?? 100))
    setApiError('')
    setNotice('')
  }

  const visibleFlags = flags.filter((flag) =>

    flag.name.toLowerCase().includes(search.toLowerCase()) &&

    (environment === 'All environments' || flag.env === environment)

  )

  const enabledCount = flags.filter((flag) => flag.enabled).length

  const averageRollout = Math.round(

    flags.reduce((sum, flag) => sum + flag.rollout, 0) /

    Math.max(flags.length, 1)

  )

  // Load all projects and their flags

  const loadProjectData = useCallback(async (authToken) => {

    if (!authToken) return

    setLoadingFlags(true)

    setApiError('')

    try {

      setAuthToken(authToken)

      const response = await api.get('/projects')

      const projectList = response.data.projects || []

      setProjects(projectList)

      if (projectList.length === 0) {

        setSelectedProject(null)

        localStorage.removeItem('flagship_project_id')

        setSelectedEnvironment(null)

        setFlags([])

        return

      }

      const savedProjectId =

        selectedProject?._id || localStorage.getItem('flagship_project_id')

      const project =

        projectList.find((item) => item._id === savedProjectId) ||

        projectList[0]

      setSelectedProject(project)

      localStorage.setItem('flagship_project_id', project._id)

      const projectEnvironments = project.environments || []

      if (projectEnvironments.length === 0) {

        setFlags([])

        setSelectedEnvironment(null)

        return

      }

      const currentEnvironment = projectEnvironments.find(

        (item) => item._id === selectedEnvironment?._id

      )

      const chosenEnvironment =

        currentEnvironment ||

        projectEnvironments.find((item) => item.name === 'development') ||

        projectEnvironments[0]

      setSelectedEnvironment(chosenEnvironment)

      const results = await Promise.all(

        projectEnvironments.map(async (env) => {

          const result = await api.get(

            `/projects/${project._id}/environments/${env._id}/flags`

          )

          return (result.data.flags || []).map((flag) => ({

            id: flag._id,

            name: flag.name,

            description: flag.description || '',

            env: env.name.charAt(0).toUpperCase() + env.name.slice(1),

            environmentId: env._id,

            enabled: flag.enabled,

            rollout: flag.rolloutPercentage ?? 100,

            color: 'violet',

          }))

        })

      )

      setFlags(results.flat())

    } catch (error) {

      if (error.response?.status === 401) {

        handleLogout()

        setAuthError('Your session expired. Please sign in again.')

      } else {

        setApiError(

          error.response?.data?.message ||

          'Could not load project data. Please check your backend.'

        )

      }

    } finally {

      setLoadingFlags(false)

    }

  }, [selectedProject?._id, selectedEnvironment?._id])

  useEffect(() => {

    if (token) {

      setAuthToken(token)

      loadProjectData(token)

    } else {

      setAuthToken(null)

    }

  }, [token, loadProjectData])

  useEffect(() => {

    localStorage.setItem('flagship_active_nav', activeNav)

  }, [activeNav])

  // Login and registration

  async function handleAuthSubmit(event) {

    event.preventDefault()

    setAuthError('')

    setAuthLoading(true)

    try {

      const endpoint =

        authMode === 'login' ? '/auth/login' : '/auth/register'

      const payload = authMode === 'login'

        ? { email: authEmail, password: authPassword }

        : {

            name: authName,

            email: authEmail,

            password: authPassword,

          }

      const response = await api.post(endpoint, payload)

      const { token: authToken, user: authUser } = response.data

      localStorage.setItem('flagship_token', authToken)

      localStorage.setItem('flagship_user', JSON.stringify(authUser))

      setAuthToken(authToken)

      setUser(authUser)

      setToken(authToken)

      setAuthPassword('')

    } catch (error) {

      setAuthError(

        error.response?.data?.message ||

        'Authentication failed. Check your details and try again.'

      )

    } finally {

      setAuthLoading(false)

    }

  }

  function handleLogout() {

    localStorage.removeItem('flagship_token')

    localStorage.removeItem('flagship_user')

    localStorage.removeItem('flagship_project_id')

    localStorage.removeItem('flagship_active_nav')

    setActiveNav('Overview')

    setAuthToken(null)

    setToken('')

    setUser(null)

    setProjects([])

    setSelectedProject(null)

    setSelectedEnvironment(null)

    setFlags([])

    setApiError('')

    setNotice('')

  }

  // Create a project, including its three environments

  async function createProject(event) {

    event.preventDefault()

    if (!projectName.trim()) return

    setApiError('')

    setNotice('')

    setCreatingProject(true)

    try {

      await api.post('/projects', {

        name: projectName.trim(),

        description: 'Managed with FlagShip',

      })

      setProjectName('')

      setShowCreateProject(false)

      setNotice('Project created successfully.')

      await loadProjectData(token)

    } catch (error) {

      setApiError(

        error.response?.data?.message || 'Could not create the project.'

      )

    } finally {

      setCreatingProject(false)

    }

  }

  // Create a feature flag in the selected environment

  async function createFlag(event) {

    event.preventDefault()

    if (!selectedProject) {

      setApiError('Create a project before adding feature flags.')

      return

    }

    const normalizedName = newName.trim().toLowerCase()

    if (!/^[a-zA-Z0-9]+(?:[_-][a-zA-Z0-9]+)*$/.test(normalizedName)) {

      setApiError('Use only letters, numbers, underscores or hyphens.')

      return

    }

    const env = environments.find(

      (item) => item._id === flagEnvironmentId

    )

    if (!env) {

      setApiError('Select a valid environment.')

      return

    }

    setApiError('')

    setNotice('')

    setCreatingFlag(true)

    try {

      await api.post(

        `/projects/${selectedProject._id}/environments/${env._id}/flags`,

        {

          name: normalizedName,

          description: newDescription.trim(),

          enabled: false,

          rolloutPercentage: 0,

        }

      )

      setNewName('')

      setNewDescription('')

      setShowCreate(false)

      setFlagEnvironmentId('')

      setActiveNav('Feature flags')

      setNotice(`Feature flag "${normalizedName}" created.`)

      await loadProjectData(token)

    } catch (error) {

      setApiError(

        error.response?.data?.message || 'Could not create the feature flag.'

      )

    } finally {

      setCreatingFlag(false)

    }

  }

  // Persist flag toggles to MongoDB

  async function toggleFlag(flagId) {

    const flag = flags.find((item) => item.id === flagId)

    if (!flag || !selectedProject || !flag.id) return

    const updatedEnabled = !flag.enabled

    setBusyFlag(flag.id)

    setApiError('')

    setNotice('')

    try {

      const response = await api.patch(

        `/projects/${selectedProject._id}/environments/${flag.environmentId}/flags/${flag.id}`,

        { enabled: updatedEnabled }

      )

      const savedEnabled = response.data.flag.enabled

      setFlags((current) =>

        current.map((item) =>

          item.id === flag.id

            ? { ...item, enabled: savedEnabled }

            : item

        )

      )

      setNotice(`${flag.name} ${savedEnabled ? 'enabled' : 'disabled'} and saved.`)

    } catch (error) {

      setApiError(

        error.response?.data?.message || 'Could not update this flag.'

      )

    } finally {

      setBusyFlag(null)

    }

  }

  async function updateFlag(event) {
    event.preventDefault()
    if (!editingFlag || !selectedProject) return

    const normalizedName = editName.trim().toLowerCase()
    const description = editDescription.trim()
    const rolloutPercentage = Number(editRollout)

    const nameChanged = normalizedName !== editingFlag.name
    const descriptionChanged = description !== (editingFlag.description || '')
    const currentRollout = editingFlag.rolloutPercentage ?? editingFlag.rollout ?? 100
    const rolloutChanged = rolloutPercentage !== Number(currentRollout)

    if (nameChanged && (!/^[a-zA-Z0-9]+(?:[_-][a-zA-Z0-9]+)*$/.test(normalizedName) || normalizedName.length < 2 || normalizedName.length > 100)) {
      setApiError('Flag name must be 2–100 characters and use only letters, numbers, underscores or hyphens.')
      return
    }
    if (!Number.isFinite(rolloutPercentage) || rolloutPercentage < 0 || rolloutPercentage > 100) {
      setApiError('Rollout percentage must be a number from 0 to 100.')
      return
    }

    const changes = {}
    if (nameChanged) changes.name = normalizedName
    if (descriptionChanged) changes.description = description
    if (rolloutChanged) changes.rolloutPercentage = rolloutPercentage

    if (Object.keys(changes).length === 0) {
      setEditingFlag(null)
      return
    }

    setApiError('')
    setNotice('')
    setSavingEdit(true)
    try {
      const response = await api.patch(
        `/projects/${selectedProject._id}/environments/${editingFlag.environmentId}/flags/${editingFlag.id}`,
        changes
      )
      const saved = response.data.flag
      setFlags((current) => current.map((item) => item.id === editingFlag.id
        ? { ...item, name: saved.name, description: saved.description || '', rollout: saved.rolloutPercentage }
        : item))
      await loadProjectData(token)
      setNotice(`Feature flag "${saved.name}" updated.`)
      setEditingFlag(null)
    } catch (error) {
      const validationErrors = error.response?.data?.errors?.map((item) => item.message).join(' ')
      setApiError(validationErrors || error.response?.data?.message || 'Could not update the feature flag.')
    } finally {
      setSavingEdit(false)
    }
  }

  // Authentication screen

  if (!token) {

    return (

      <div className="app-shell auth-shell">

        <form className="create-modal auth-modal" onSubmit={handleAuthSubmit}>

          <div className="modal-top">

            <span className="modal-icon">

              <Command size={22} />

            </span>

          </div>

          <div className="section-kicker">FLAGSHIP WORKSPACE</div>

          <h2>

            {authMode === 'login' ? 'Welcome back.' : 'Create your account.'}

          </h2>

          <p>

            {authMode === 'login'

              ? 'Sign in to manage your feature releases.'

              : 'Start managing feature releases with confidence.'}

          </p>

          {authMode === 'register' && (

            <label>

              Full name

              <input

                required

                value={authName}

                onChange={(event) => setAuthName(event.target.value)}

                placeholder="Your name"

              />

            </label>

          )}

          <label>

            Email address

            <input

              required

              type="email"

              value={authEmail}

              onChange={(event) => setAuthEmail(event.target.value)}

              placeholder="you@example.com"

            />

          </label>

          <label>

            Password

            <input

              required

              type="password"

              minLength={8}

              value={authPassword}

              onChange={(event) => setAuthPassword(event.target.value)}

              placeholder="Enter your password"

            />

          </label>

          {authError && (

            <p role="alert" className="auth-error">{authError}</p>

          )}

          <button

            className="primary-button auth-submit"

            type="submit"

            disabled={authLoading}

          >

            {authLoading

              ? 'Please wait...'

              : authMode === 'login'

                ? 'Sign in'

                : 'Create account'}

          </button>

          <p className="auth-switch">

            {authMode === 'login'

              ? "Don't have an account?"

              : 'Already have an account?'}{' '}

            <button

              type="button"

              className="text-button"

              onClick={() => {

                setAuthMode(authMode === 'login' ? 'register' : 'login')

                setAuthError('')

              }}

            >

              {authMode === 'login' ? 'Create one' : 'Sign in'}

            </button>

          </p>

        </form>

      </div>

    )

  }

  return (

    <div className="app-shell">

      <aside className="sidebar">

        <a

          className="brand"

          href="#"

          onClick={(event) => {

            event.preventDefault()

            setActiveNav('Overview')

          }}

        >

          <span className="brand-mark">

            <Command size={21} strokeWidth={2.5} />

          </span>

          <span>flag<span className="brand-light">ship</span><sup>®</sup></span>

        </a>

        <div className="workspace-label">WORKSPACE</div>

        <button className="workspace-switch">

          <span className="workspace-avatar">

            {(user?.name || 'F').charAt(0).toUpperCase()}

          </span>

          <span className="workspace-copy">

            <strong>{selectedProject?.name || 'Your workspace'}</strong>

            <small>{user?.email || 'Feature management'}</small>

          </span>

          <ChevronDown size={15} />

        </button>

        <div className="nav-caption">BUILD</div>

        <nav className="nav-list">

          {navItems.map(({ label, icon: Icon }) => (

            <button

              key={label}

              className={`nav-item ${activeNav === label ? 'active' : ''}`}

              onClick={() => setActiveNav(label)}

            >

              <Icon size={18} strokeWidth={1.8} />

              <span>{label}</span>

              {label === 'Feature flags' && (

                <span className="nav-count">{flags.length}</span>

              )}

            </button>

          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="upgrade-card">

            <div className="upgrade-icon"><Sparkles size={18} /></div>

            <strong>Ship without fear.</strong>

            <p>Release with confidence. Roll back in seconds.</p>

            <button onClick={() => setActiveNav('Environments')}>

              Explore environments <span>↗</span>

            </button>

          </div>

          <button className="nav-item" onClick={() => setNotice('FlagShip feature flag manager.')}>

            <CircleHelp size={18} /><span>Help & support</span>

          </button>

          <button className="nav-item" onClick={handleLogout}>

            <LogOut size={18} /><span>Log out</span>

          </button>

          <div className="profile-row">

            <div className="profile-avatar">

              {(user?.name || 'U').charAt(0).toUpperCase()}

            </div>

            <div className="profile-copy">

              <strong>{user?.name || 'FlagShip user'}</strong>

              <small>{user?.email || 'Signed in'}</small>

            </div>

          </div>

        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div className="breadcrumbs">

            <span>Workspace</span>

            <span className="crumb-slash">/</span>

            <strong>{activeNav}</strong>

          </div>

          <div className="topbar-actions">

            <span className="system-status">

              <span className="status-dot" />

              {loadingFlags ? 'Syncing data...' : 'API connected'}

            </span>

            <button

              className="icon-button"

              aria-label="Notifications"

              onClick={() => setNotice('You are all caught up.')}

            >

              <Bell size={18} />

            </button>

            <div className="top-avatar">

              {(user?.name || 'U').charAt(0).toUpperCase()}

            </div>

          </div>

        </header>

        <div className="page-content">

          {apiError && (

            <div className="api-notice api-error" role="alert">

              {apiError}

              <button onClick={() => setApiError('')}>Dismiss</button>

            </div>

          )}

          {notice && (

            <div className="api-notice api-success" role="status">

              {notice}

              <button onClick={() => setNotice('')}>Dismiss</button>

            </div>

          )}

          {loadingFlags && (

            <div className="api-notice">

              <LoaderCircle size={16} /> Loading your projects and feature flags...

            </div>

          )}

          {activeNav === 'Overview' ? (
            <>
<section className="welcome-row">

            <div>

              <div className="eyebrow">

                <span className="eyebrow-line" />

                YOUR RELEASE CONTROL CENTER

              </div>

              <h1>

                {activeNav === 'Overview'

                  ? <>Ship better.<br /><span>Break nothing.</span></>

                  : activeNav}

              </h1>

              <p className="welcome-description">

                {activeNav === 'Overview'

                  ? 'Every feature. Every environment. All under control.'

                  : `Manage your ${activeNav.toLowerCase()} in one place.`}

              </p>

            </div>

            <button

              className="primary-button"

              onClick={() => {

                if (!selectedProject) {

                  setShowCreateProject(true)

                } else {

                  openCreateFlag()

                }

              }}

            >

              <Plus size={17} />

              {!selectedProject ? 'Create project' : 'New feature flag'}

            </button>

          </section>

          {projects.length === 0 && !loadingFlags && (

            <section className="panel" style={{ marginBottom: 24 }}>

              <div className="panel-heading">

                <div>

                  <div className="section-kicker">GET STARTED</div>

                  <h3>Create your first project</h3>

                  <p>Your project will include Development, Staging and Production environments.</p>

                </div>

              </div>

              <button

                className="primary-button"

                onClick={() => setShowCreateProject(true)}

              >

                <Plus size={16} /> Create project

              </button>

            </section>

          )}

          {projects.length > 0 && (

            <section className="panel" style={{ marginBottom: 24 }}>

              <div className="panel-heading compact">

                <div>

                  <div className="section-kicker">CURRENT PROJECT</div>

                  <h3>{selectedProject?.name || 'Loading project...'}</h3>

                  <p>Switch projects to manage their feature flags.</p>

                </div>

                <select

                  aria-label="Select project"

                  value={selectedProject?._id || ''}

                  onChange={(event) => {

                    const project = projects.find(

                      (item) => item._id === event.target.value

                    )

                    if (project) {

                      setSelectedProject(project)

                      localStorage.setItem('flagship_project_id', project._id)

                      setSelectedEnvironment(null)

                      setFlags([])

                    }

                  }}

                >

                  {projects.map((project) => (

                    <option key={project._id} value={project._id}>

                      {project.name}

                    </option>

                  ))}

                </select>

              </div>

            </section>

          )}

          <section className="hero-panel">

            <div className="hero-grid" />

            <div className="hero-content">

              <div className="hero-pill">

                <Zap size={13} fill="currentColor" /> RELEASE INTELLIGENCE

                <span>·</span> LIVE OVERVIEW

              </div>

              <h2>Your next release<br />starts <em>here.</em></h2>

              <p>Control rollouts, test ideas, and ship new experiences without the all-or-nothing deploy.</p>

              <button

                className="hero-button"

                onClick={() => setActiveNav('Feature flags')}

              >

                Explore feature flags <span>↗</span>

              </button>

            </div>

            <div className="hero-art" aria-hidden="true">

              <div className="orbit orbit-one" />

              <div className="orbit orbit-two" />

              <div className="orbit orbit-three" />

              <div className="orbit-core"><Command size={43} /></div>

              <div className="float-card float-card-top">

                <span className="float-icon mint-bg"><ShieldCheck size={16} /></span>

                <span><b>Safe rollout</b><small>Protected release</small></span>

                <span className="float-check">✓</span>

              </div>

              <div className="float-card float-card-bottom">

                <span className="float-icon purple-bg"><GitBranch size={16} /></span>

                <span><b>{averageRollout}% rollout</b><small>Average across flags</small></span>

                <span className="mini-bars"><i /><i /><i /><i /><i /></span>

              </div>

            </div>

            <div className="hero-decoration">F / 001</div>

          </section>

          <section className="stats-grid">

            <article className="stat-card">

              <div className="stat-top">

                <span>Total flags</span>

                <span className="stat-icon purple-bg"><ToggleLeft size={18} /></span>

              </div>

              <div className="stat-value">{flags.length}<span className="stat-unit">flags</span></div>

              <div className="stat-foot">

                <span className="trend-positive"><ArrowUpRight size={14} /> Workspace</span>

                <span>across environments</span>

              </div>

            </article>

            <article className="stat-card">

              <div className="stat-top">

                <span>Currently enabled</span>

                <span className="stat-icon mint-bg"><Zap size={17} /></span>

              </div>

              <div className="stat-value">{enabledCount}<span className="stat-unit">active</span></div>

              <div className="stat-foot">

                <span className="trend-positive"><Activity size={14} /> Live controls</span>

                <span>flags switched on</span>

              </div>

            </article>

            <article className="stat-card">

              <div className="stat-top">

                <span>Environments</span>

                <span className="stat-icon blue-bg"><Layers3 size={17} /></span>

              </div>

              <div className="stat-value">

                {String(environments.length).padStart(2, '0')}

                <span className="stat-unit">spaces</span>

              </div>

              <div className="environment-dots">

                <span /><span /><span />

                <small>Dev · Stage · Prod</small>

              </div>

            </article>

            <article className="stat-card stat-card-accent">

              <div className="stat-top">

                <span>Average rollout</span>

                <span className="stat-icon orange-bg"><Activity size={17} /></span>

              </div>

              <div className="stat-value">{averageRollout}<span className="stat-unit">%</span></div>

              <div className="rollout-track">

                <span style={{ width: `${averageRollout}%` }} />

              </div>

            </article>

          </section>

          <section className="content-grid">

            <article className="panel flags-panel">

              <div className="panel-heading">

                <div>

                  <div className="section-kicker">RELEASE MANAGEMENT</div>

                  <h3>Feature flags <span className="heading-count">{flags.length}</span></h3>

                  <p>Fine-tune what ships, and who sees it.</p>

                </div>

                <button

                  className="text-button"

                  onClick={() => setActiveNav('Feature flags')}

                >

                  View all <span>↗</span>

                </button>

              </div>

              <div className="flag-toolbar">

                <div className="search-box">

                  <Search size={16} />

                  <input

                    value={search}

                    onChange={(event) => setSearch(event.target.value)}

                    placeholder="Search feature flags..."

                  />

                </div>

                <select

                  value={environment}

                  onChange={(event) => {

                    setEnvironment(event.target.value)

                    const env = environments.find(

                      (item) =>

                        item.name.toLowerCase() === event.target.value.toLowerCase()

                    )

                    if (env) setSelectedEnvironment(env)

                  }}

                  aria-label="Filter environment"

                >

                  <option>All environments</option>

                  {environments.map((env) => (

                    <option

                      key={env._id}

                      value={env.name.charAt(0).toUpperCase() + env.name.slice(1)}

                    >

                      {env.name.charAt(0).toUpperCase() + env.name.slice(1)}

                    </option>

                  ))}

                </select>

              </div>

              <div className="flag-list">

                {visibleFlags.map((flag) => (

                  <div className="flag-row" key={flag.id}>

                    <span className={`flag-symbol ${flag.color}`}>

                      <FlaskConical size={17} />

                    </span>

                    <div className="flag-info">

                      <strong>{flag.name}</strong>

                      <p>{flag.description || 'No description provided'}</p>

                      <div className="flag-meta">

                        <span className={`env-tag ${flag.env.toLowerCase()}`}>

                          {flag.env}

                        </span>

                        <span className="rollout-label">{flag.rollout}% rollout</span>

                      </div>

                    </div>

                    <div className="flag-control">

                      <button type="button" className="text-button" onClick={() => openEditFlag(flag)}>Edit</button>

                      <span className={`flag-state ${flag.enabled ? 'is-on' : ''}`}>

                        {busyFlag === flag.id ? 'Saving…' : flag.enabled ? 'Enabled' : 'Disabled'}

                      </span>

                      <button

                        aria-label={`${flag.enabled ? 'Disable' : 'Enable'} ${flag.name}`}

                        disabled={busyFlag === flag.id}

                        className={`toggle ${flag.enabled ? 'on' : ''}`}

                        type="button"

                        onClick={() => toggleFlag(flag.id)}

                      >

                        <span />

                      </button>

                    </div>

                  </div>

                ))}

                {!loadingFlags && visibleFlags.length === 0 && (

                  <div className="empty-state">

                    {flags.length === 0

                      ? 'No feature flags yet. Create your first flag.'

                      : 'No flags match your search or environment.'}

                  </div>

                )}

              </div>

              <button

                className="add-flag-row"

                onClick={() => {

                  if (!selectedProject) {

                    setShowCreateProject(true)

                  } else {

                    openCreateFlag()

                  }

                }}

              >

                <Plus size={16} /> Create a new feature flag

              </button>

            </article>

            <div className="right-column">

              <article className="panel environments-panel">

                <div className="panel-heading compact">

                  <div>

                    <div className="section-kicker">YOUR PIPELINE</div>

                    <h3>Environments</h3>

                  </div>

                  <button

                    className="more-button"

                    onClick={() => setActiveNav('Environments')}

                  >

                    ···

                  </button>

                </div>

                <p className="panel-subtitle">

                  One project, three release stages.

                </p>

                <div className="environment-list">

                  {environments.map((env) => (

                    <div className="environment-row" key={env._id}>

                      <span className={`environment-icon ${

                        env.name === 'development'

                          ? 'dev'

                          : env.name === 'staging'

                            ? 'stage'

                            : 'prod'

                      }`}>

                        {env.name === 'production'

                          ? <ShieldCheck size={17} />

                          : env.name === 'staging'

                            ? <FlaskConical size={17} />

                            : <Command size={17} />}

                      </span>

                      <div>

                        <strong>

                          {env.name.charAt(0).toUpperCase() + env.name.slice(1)}

                        </strong>

                        <small>

                          {env.name === 'development'

                            ? 'Build & experiment'

                            : env.name === 'staging'

                              ? 'Test before release'

                              : 'Live for your users'}

                        </small>

                      </div>

                      <span className={`environment-indicator ${

                        env.name === 'staging' ? 'blue' : 'green'

                      }`}>

                        {env.name === 'staging' ? 'Ready' : 'Active'}

                      </span>

                    </div>

                  ))}

                  {environments.length === 0 && (

                    <p className="panel-subtitle">Create a project to set up environments.</p>

                  )}

                </div>

              </article>

              <article className="evaluation-card">

                <div className="evaluation-top">

                  <span className="evaluation-icon"><Activity size={18} /></span>

                  <span className="live-badge"><i /> READY TO TEST</span>

                </div>

                <h3>Test before<br />you <span>ship.</span></h3>

                <p>Preview feature behavior for a specific user, before it reaches production.</p>

                <button onClick={() => setActiveNav('Evaluation playground')}>

                  Open evaluation lab <span>↗</span>

                </button>

                <div className="evaluation-orb" />

              </article>

            </div>

          </section>

          <footer className="footer">

            <span>© 2026 FlagShip, Inc.</span>

            <span><i /> Built for confident releases</span>

            <span>MADE FOR DEVELOPERS <Sparkles size={12} /></span>

          </footer>
            </>
          ) : (
            <section className="panel page-panel">
              {activeNav === 'Projects' && (
                <>
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">WORKSPACE</div>
                      <h3>Your projects</h3>
                      <p>Organize feature flags by application or service.</p>
                    </div>
                    <button className="primary-button" onClick={() => setShowCreateProject(true)}>
                      <Plus size={16} /> Create project
                    </button>
                  </div>
                  {projects.length === 0 ? (
                    <div className="empty-state">No projects yet. Create your first project to get started.</div>
                  ) : (
                    <div className="environment-list">
                      {projects.map((project) => (
                        <button
                          type="button"
                          key={project._id}
                          className="environment-row project-row"
                          onClick={() => {
                            setSelectedProject(project)
                            localStorage.setItem('flagship_project_id', project._id)
                            setSelectedEnvironment(null)
                            setEnvironment('All environments')
                            setActiveNav('Feature flags')
                          }}
                        >
                          <span className="environment-icon dev"><Blocks size={17} /></span>
                          <div>
                            <strong>{project.name}</strong>
                            <small>{(project.environments || []).length} environments · Click to manage flags</small>
                          </div>
                          <span className="environment-indicator green">Open ↗</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeNav === 'Feature flags' && (
                <>
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">RELEASE MANAGEMENT</div>
                      <h3>Feature flags <span className="heading-count">{visibleFlags.length}</span></h3>
                      <p>Enable or disable features and filter by environment.</p>
                    </div>
                    <button className="primary-button" onClick={() => selectedProject ? openCreateFlag() : setShowCreateProject(true)}>
                      <Plus size={16} /> {selectedProject ? 'Create flag' : 'Create project'}
                    </button>
                  </div>
                  <div className="flag-toolbar">
                    <div className="search-box">
                      <Search size={16} />
                      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search feature flags..." />
                    </div>
                    <select value={environment} onChange={(event) => setEnvironment(event.target.value)} aria-label="Filter environment">
                      <option>All environments</option>
                      {environments.map((env) => (
                        <option key={env._id} value={env.name.charAt(0).toUpperCase() + env.name.slice(1)}>
                          {env.name.charAt(0).toUpperCase() + env.name.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flag-list">
                    {visibleFlags.map((flag) => (
                      <div className="flag-row" key={flag.id}>
                        <span className={`flag-symbol ${flag.color}`}><FlaskConical size={17} /></span>
                        <div className="flag-info">
                          <strong>{flag.name}</strong>
                          <p>{flag.description || 'No description provided'}</p>
                          <div className="flag-meta">
                            <span className={`env-tag ${flag.env.toLowerCase()}`}>{flag.env}</span>
                            <span className="rollout-label">{flag.rollout}% rollout</span>
                          </div>
                        </div>
                        <div className="flag-control">

                          <button type="button" className="secondary-button flag-edit-button" onClick={() => openEditFlag(flag)}>Edit</button>
                          <span className={`flag-state ${flag.enabled ? 'is-on' : ''}`}>{busyFlag === flag.id ? 'Saving…' : flag.enabled ? 'Enabled' : 'Disabled'}</span>
                          <button type="button" aria-label={`${flag.enabled ? 'Disable' : 'Enable'} ${flag.name}`} disabled={busyFlag === flag.id} className={`toggle ${flag.enabled ? 'on' : ''}`} onClick={() => toggleFlag(flag.id)}><span /></button>
                        </div>
                      </div>
                    ))}
                    {!loadingFlags && visibleFlags.length === 0 && <div className="empty-state">{flags.length === 0 ? 'No feature flags yet. Create your first flag.' : 'No flags match your search or environment.'}</div>}
                  </div>
                </>
              )}

              {activeNav === 'Environments' && (
                <>
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">DEPLOYMENT PIPELINE</div>
                      <h3>Environments</h3>
                      <p>Keep development, staging, and production releases separate.</p>
                    </div>
                  </div>
                  {!selectedProject ? (
                    <div className="empty-state">Create a project first to set up its environments.</div>
                  ) : (
                    <>
                      <p className="panel-subtitle">Project: <strong>{selectedProject.name}</strong></p>
                      <div className="environment-list">
                        {environments.map((env) => {
                          const envLabel = env.name.charAt(0).toUpperCase() + env.name.slice(1)
                          const envFlags = flags.filter((flag) => flag.environmentId === env._id)
                          return (
                            <div className="environment-row environment-page-row" key={env._id}>
                              <span className={`environment-icon ${env.name === 'development' ? 'dev' : env.name === 'staging' ? 'stage' : 'prod'}`}>
                                {env.name === 'production' ? <ShieldCheck size={17} /> : env.name === 'staging' ? <FlaskConical size={17} /> : <Command size={17} />}
                              </span>
                              <div>
                                <strong>{envLabel}</strong>
                                <small>{env.name === 'development' ? 'Build and experiment' : env.name === 'staging' ? 'Test before release' : 'Live environment for users'}</small>
                              </div>
                              <span className="environment-indicator green">{envFlags.length} flags</span>
                              <button className="secondary-button" type="button" onClick={() => {
                                setSelectedEnvironment(env)
                                setEnvironment(envLabel)
                                setActiveNav('Feature flags')
                              }}>View flags</button>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </>
              )}

              {activeNav === 'Activity log' && (
                <>
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">AUDIT TRAIL</div>
                      <h3>Activity log</h3>
                      <p>Review changes made in your FlagShip workspace.</p>
                    </div>
                  </div>
                  <div className="empty-state">
                    Activity history is not available yet. This section is ready for an audit-log backend integration.
                  </div>
                </>
              )}
            </section>
          )}

          {showCreateProject && (
            <div
              className="modal-backdrop"
              onClick={(event) => {
                if (event.target === event.currentTarget && !creatingProject) {
                  setShowCreateProject(false)
                }
              }}
            >
              <form
                className="create-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-project-title"
                onSubmit={createProject}
              >
                <div className="modal-top">
                  <span className="modal-icon"><Blocks size={20} /></span>
                  <button
                    className="modal-close"
                    type="button"
                    aria-label="Close create project dialog"
                    disabled={creatingProject}
                    onClick={() => setShowCreateProject(false)}
                  >
                    ×
                  </button>
                </div>
                <h2 id="create-project-title">Create a project</h2>
                <p>Your project will include Development, Staging, and Production environments.</p>
                <label htmlFor="project-name">Project name</label>
                <input
                  id="project-name"
                  name="projectName"
                  type="text"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="e.g. Mobile app"
                  minLength={2}
                  maxLength={100}
                  autoFocus
                  required
                />
                {apiError && <div className="api-notice api-error" role="alert">{apiError}</div>}
                <div className="modal-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={creatingProject}
                    onClick={() => setShowCreateProject(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={creatingProject || projectName.trim().length < 2}
                  >
                    {creatingProject ? 'Creating...' : 'Create project'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {showCreate && (
            <div
              className="modal-backdrop"
              onClick={(event) => {
                if (event.target === event.currentTarget && !creatingFlag) {
                  setShowCreate(false)
                }
              }}
            >
              <form
                className="create-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-flag-title"
                onSubmit={createFlag}
              >
                <div className="modal-top">
                  <span className="modal-icon"><FlaskConical size={20} /></span>
                  <button
                    className="modal-close"
                    type="button"
                    aria-label="Close create flag dialog"
                    disabled={creatingFlag}
                    onClick={() => setShowCreate(false)}
                  >
                    ×
                  </button>
                </div>
                <h2 id="create-flag-title">Create a feature flag</h2>
                <p>Start disabled, then enable the flag when you are ready to release.</p>
                <label htmlFor="flag-name">Flag name</label>
                <input
                  id="flag-name"
                  name="flagName"
                  type="text"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="e.g. new_checkout_flow"
                  minLength={2}
                  maxLength={100}
                  required
                />
                <label htmlFor="flag-environment">Environment</label>
                <select
                  id="flag-environment"
                  name="flagEnvironment"
                  value={flagEnvironmentId}
                  onChange={(event) => setFlagEnvironmentId(event.target.value)}
                  required
                >
                  {environments.map((env) => (
                    <option key={env._id} value={env._id}>
                      {env.name.charAt(0).toUpperCase() + env.name.slice(1)}
                    </option>
                  ))}
                </select>
                <label htmlFor="flag-description">
                  Description <span className="optional-label">OPTIONAL</span>
                </label>
                <textarea
                  id="flag-description"
                  name="flagDescription"
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  placeholder="What does this flag control?"
                  maxLength={500}
                  rows={3}
                />
                {apiError && <div className="api-notice api-error" role="alert">{apiError}</div>}
                <div className="modal-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={creatingFlag}
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={creatingFlag || newName.trim().length < 2 || !flagEnvironmentId}
                  >
                    {creatingFlag ? 'Creating...' : 'Create flag'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {editingFlag && (
            <div className="modal-backdrop" onClick={(event) => {
              if (event.target === event.currentTarget && !savingEdit) setEditingFlag(null)
            }}>
              <form className="create-modal" role="dialog" aria-modal="true" aria-labelledby="edit-flag-title" onSubmit={updateFlag}>
                <div className="modal-top">
                  <span className="modal-icon"><FlaskConical size={20} /></span>
                  <button className="modal-close" type="button" aria-label="Close edit flag dialog" disabled={savingEdit} onClick={() => setEditingFlag(null)}>×</button>
                </div>
                <h2 id="edit-flag-title">Edit feature flag</h2>
                <p>Update the flag name, description, and rollout percentage.</p>
                <label htmlFor="edit-flag-name">Flag name</label>
                <input id="edit-flag-name" type="text" value={editName} onChange={(event) => setEditName(event.target.value)} minLength={2} maxLength={100} required />
                <label htmlFor="edit-flag-description">Description <span className="optional-label">OPTIONAL</span></label>
                <textarea id="edit-flag-description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={500} rows={3} />
                <label htmlFor="edit-flag-rollout">Rollout percentage</label>
                <input id="edit-flag-rollout" type="number" value={editRollout} onChange={(event) => setEditRollout(event.target.value)} min={0} max={100} step={1} required />
                {apiError && <div className="api-notice api-error" role="alert">{apiError}</div>}
                <div className="modal-actions">
                  <button className="secondary-button" type="button" disabled={savingEdit} onClick={() => setEditingFlag(null)}>Cancel</button>
                  <button className="primary-button" type="submit" disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save changes'}</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
