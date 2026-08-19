 #include <stdio.h>
#include <stdlib.h>
#include <time.h>

// Function to merge two subarrays
void merge(int a[], int low, int mid, int high)
{
    int i = low, j = mid + 1, k = low;
    int temp[100000];

    while (i <= mid && j <= high)
    {
        if (a[i] <= a[j])
            temp[k++] = a[i++];
        else
            temp[k++] = a[j++];
    }

    while (i <= mid)
        temp[k++] = a[i++];

    while (j <= high)
        temp[k++] = a[j++];

    for (i = low; i <= high; i++)
        a[i] = temp[i];
}

// Merge Sort function
void mergeSort(int a[], int low, int high)
{
    if (low < high)
    {
        int mid = (low + high) / 2;

        mergeSort(a, low, mid);
        mergeSort(a, mid + 1, high);
        merge(a, low, mid, high);
    }
}

int main()
{
    int n, i;
    int a[100000];
    clock_t start, end;
    double cpu_time;

    printf("Enter the number of elements: ");
    scanf("%d", &n);

    // Generate random numbers
    srand(time(NULL));
    for (i = 0; i < n; i++)
        a[i] = rand() % 100000;

    start = clock();

    mergeSort(a, 0, n - 1);

    end = clock();

    cpu_time = ((double)(end - start)) / CLOCKS_PER_SEC;

    printf("\nSorted Elements:\n");
    for (i = 0; i < n; i++)
        printf("%d ", a[i]);

    printf("\n\nTime taken = %lf seconds\n", cpu_time);

    return 0;
}