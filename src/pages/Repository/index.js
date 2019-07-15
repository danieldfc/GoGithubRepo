import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, Pagination, IssueFilter } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    pagination: true,
    page: 1,
    filters: [
      { state: 'all', active: true },
      { state: 'open', active: false },
      { state: 'closed', active: false },
    ],
    filterIndex: 0,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleFilterClick = async filterIndex => {
    await this.setState({ filterIndex });

    this.loaderIssues();
  };

  handlePagination = async result => {
    const { page, issues, pagination } = this.state;

    if (!issues) {
      this.setState({
        pagination: false,
      });
    }

    if (pagination) {
      await this.setState({
        page: result === 'prev' ? page - 1 : page + 1,
      });
      this.loaderIssues();
    }
  };

  loaderIssues = async () => {
    const { filters, filterIndex, page } = this.state;
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 5,
        page,
      },
    });

    this.setState({ issues: response.data, pagination: true });
  };

  render() {
    const {
      repository,
      issues,
      loading,
      page,
      filters,
      filterIndex,
      pagination,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar para os repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <IssueFilter active={filterIndex}>
            {filters.map((filter, index) => (
              <button
                type="button"
                key={filter.label}
                onClick={() => this.handleFilterClick(index)}
              >
                {filter.label}
              </button>
            ))}
          </IssueFilter>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <Pagination>
          <button
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePagination('prev')}
          >
            Prev
          </button>
          <span>Page {page}</span>
          <button
            type="button"
            enabled={pagination ? 1 : 0}
            onClick={() => this.handlePagination('next')}
          >
            Next
          </button>
        </Pagination>
      </Container>
    );
  }
}
