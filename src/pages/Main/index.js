import React, { Component } from 'react';
import moment from 'moment';
import { Container, Form, EmptyFallback } from './styles';

// Assets
import logo from '../../assets/images/github-compare-logo.png';

// Components
import CompareList from '../../components/CompareList';

// Services
import api from '../../services/api';

export default class Main extends Component {
  state = {
    loading: false,
    repositoryError: false,
    repositoryInput: '',
    repositories: [],
    updatingRepositoriesId: [],
  };

  async componentDidMount() {
    this.setState({ loading: true });
    this.setState({ loading: false, repositories: await this.getLocalRepositories() });
    this.repositoryInput = React.createRef();
  }

  getLocalRepositories = async () => JSON.parse(await localStorage.getItem('GitHubCompare@repositories')) || [];

  handleAddRepository = async (event) => {
    event.preventDefault();

    const { loading, repositoryInput, repositories } = this.state;

    if (loading || !repositoryInput) return;

    this.setState({ loading: true });
    this.repositoryInput.current.blur();

    if (
      repositories.filter(repository => repository.full_name === repositoryInput.toLowerCase())
        .length
    ) {
      this.setState({
        loading: false,
        repositoryError: true,
      });
      this.repositoryInput.current.focus();
      return;
    }

    try {
      const { data: newRepository } = await api.gitHub.get(`/repos/${repositoryInput}`);

      newRepository.last_commit = moment(newRepository.pushed_at).fromNow();

      this.setState({
        repositoryError: false,
        repositoryInput: '',
        repositories: [newRepository, ...repositories],
      });

      await localStorage.setItem(
        'GitHubCompare@repositories',
        JSON.stringify([newRepository, ...repositories]),
      );
    } catch (err) {
      this.setState({ repositoryError: true });
      this.repositoryInput.current.focus();
    } finally {
      this.setState({ loading: false });
    }
  };

  handleRemoveRepository = async (id) => {
    const { repositories } = this.state;

    const updatedRepositories = repositories.filter(repository => repository.id !== id);

    this.setState({ repositories: updatedRepositories });

    await localStorage.setItem('GitHubCompare@repositories', JSON.stringify(updatedRepositories));
  };

  handleUpdateRepository = async (id) => {
    const { updatingRepositoriesId, repositories } = this.state;

    if (updatingRepositoriesId.includes(id)) return;

    this.setState(state => ({ updatingRepositoriesId: [id, ...state.updatingRepositoriesId] }));

    const currentRepository = repositories.find(repository => repository.id === id);

    try {
      const { data: newRepository } = await api.gitHub.get(`/repos/${currentRepository.full_name}`);

      newRepository.last_commit = moment(newRepository.pushed_at).fromNow();

      const updatedRepositories = repositories.map(repository => (
        repository.id === newRepository.id ? newRepository : repository
      ));

      this.setState({
        repositoryError: false,
        repositoryInput: '',
        repositories: updatedRepositories,
      });

      await localStorage.setItem('GitHubCompare@repositories', JSON.stringify(updatedRepositories));
    } catch (err) {
      this.handleRemoveRepository(currentRepository.id);

      this.setState({
        repositoryError: true,
        repositoryInput: currentRepository.full_name,
      });
      this.repositoryInput.current.focus();
    } finally {
      this.setState({
        updatingRepositoriesId: updatingRepositoriesId.filter(
          updatingRepositorieId => updatingRepositorieId !== id,
        ),
      });
    }
  };

  render() {
    const {
      loading,
      updatingRepositoriesId,
      repositoryError,
      repositoryInput,
      repositories,
    } = this.state;

    return (
      <Container>
        <img src={logo} alt="GitHub Compare" />

        <Form repositoryError={repositoryError} onSubmit={this.handleAddRepository}>
          <input
            ref={this.repositoryInput}
            type="text"
            placeholder="user/repository"
            value={repositoryInput}
            onChange={event => this.setState({ repositoryInput: event.target.value })}
          />
          <button type="submit">
            {loading ? <i className="fa fa-spinner fa-pulse" /> : <i className="fa fa-plus" />}
          </button>
        </Form>

        {repositories.length === 0 && (
          <EmptyFallback>
            <h1>You haven&apos;t added any repositories yet.</h1>
            <h3>Enter a user and a GitHub repository above.</h3>
          </EmptyFallback>
        )}

        <CompareList
          repositories={repositories}
          updatingRepositoriesId={updatingRepositoriesId}
          updateRepository={this.handleUpdateRepository}
          removeRepository={this.handleRemoveRepository}
        />
      </Container>
    );
  }
}
