const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(
      process.env.NEXT_PUBLIC_TOKEN_KEY || 'auth_token'
    );
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...((options.headers as Record<string, string>) || {}),
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired - could trigger logout here
        throw new Error('UNAUTHORIZED');
      }

      const error = await response
        .json()
        .catch(() => ({ error: { code: 'UNKNOWN' } }));
      throw new Error(error.error?.code || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Groups API
  async getMyGroups() {
    return this.request<
      Array<{
        id: string;
        name: string;
        ownerId: string;
        members: Array<{ userId: string; role: string }>;
        createdAt: string;
      }>
    >('/groups/mine');
  }

  async createGroup(name: string) {
    return this.request<{ id: string; name: string }>('/groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // Events API
  async getEvents(groupId: string, from?: string, to?: string) {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const query = params.toString();
    const response = await this.request<{
      items: Array<{
        _id: string;
        groupId: string;
        date: string;
        type: string;
        payload?: {
          name?: string;
          description?: string;
          style?: {
            background: string;
            color: string;
          };
        };
        creatorId: string;
        createdAt: string;
        updatedAt: string;
      }>;
      total: number;
    }>(`/groups/${groupId}/events${query ? `?${query}` : ''}`);

    return response.items;
  }

  async createEvent(
    groupId: string,
    event: {
      date: string;
      type: string;
      payload?: Record<string, unknown>;
    }
  ) {
    return this.request(`/groups/${groupId}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(
    groupId: string,
    eventId: string,
    event: {
      date: string;
      type: string;
      payload?: Record<string, unknown>;
    }
  ) {
    return this.request(`/groups/${groupId}/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(groupId: string, eventId: string) {
    return this.request(`/groups/${groupId}/events/${eventId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
